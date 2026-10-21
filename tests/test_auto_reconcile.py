"""Browser-level tests of content script without opening the extension popup.

The HTML is synthetic; tests do not assert compatibility with live ChatGPT.
"""
from pathlib import Path
import os
from shutil import which
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
MOCK="""
window.__savedOn = true;
window.__changed = [];
window.chrome = {
  runtime: {lastError: null, onMessage: {addListener: cb => window.__message = cb}},
  storage: {
    onChanged: {addListener: cb => window.__changed.push(cb)},
    local: {get: (defaults, callback) => callback({buttonOn:window.__savedOn})}
  }
};
window.__getStatus = () => {
  let status;
  window.__message({type:'chatgpt-rtl-ping'}, {}, result => status = result);
  return status;
};
window.__toggle = on => {
  window.__savedOn = on;
  window.__changed.forEach(cb => cb({buttonOn:{newValue:on}}, 'local'));
};
"""



def launch_test_chromium(playwright):
    """Use Playwright's managed Chromium in CI; system Chromium locally if present."""
    kwargs = {"headless": True}
    custom = os.environ.get("RTL_CHROMIUM_EXECUTABLE")
    if custom:
        kwargs["executable_path"] = custom
    elif os.environ.get("CI", "").lower() != "true":
        local = which("chromium") or which("chromium-browser")
        if local:
            kwargs["executable_path"] = local
    return playwright.chromium.launch(**kwargs)

def test_no_popup_and_recovery():
  with sync_playwright() as p:
    browser=launch_test_chromium(p)
    page=browser.new_page()
    errors=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    html='<html><head><style>main p {text-align:justify;}</style></head><body><nav><a href="/c/1">عنوان</a></nav><main><div><p id="initial">متن اولیه</p><p id="english">English text</p><pre><code id="code">python</code></pre></div></main></body></html>'
    page.set_content(html)
    page.evaluate(MOCK)
    page.evaluate("window.__savedOn = true")
    page.add_script_tag(path=str(ROOT/'content.js'))
    def attr(css): return page.locator(css).get_attribute('data-chatgpt-rtl-dir')
    page.wait_for_function("document.querySelector('#initial').dataset.chatgptRtlDir === 'rtl'")
    assert page.locator('#initial').evaluate('(e)=>getComputedStyle(e).textAlign')=='right'
    assert attr('#english')=='ltr'
    assert attr('#code') is None
    status=page.evaluate('window.__getStatus()')
    assert status['autoReconcileActive'] and status['version']=='1.6.3'
    assert status['messages']==0
    print('PASS initial rendering: On, no semantic wrappers, no popup')

    # Streaming/new messages: should work via MutationObserver without opening popup.
    page.evaluate("document.querySelector('main').insertAdjacentHTML('beforeend','<div><h2 id=\"heading\">عنوان تازه</h2><p id=\"stream\">Hi there</p></div>')")
    page.wait_for_function("document.querySelector('#heading').dataset.chatgptRtlDir === 'rtl'")
    page.evaluate("document.querySelector('#stream').firstChild.textContent='سلام، پاسخ جدید'")
    page.wait_for_function("document.querySelector('#stream').dataset.chatgptRtlDir === 'rtl'")
    assert page.locator('#heading').evaluate('(e)=>getComputedStyle(e).textAlign')=='right'
    print('PASS new message and stream without popup')

    # A suppressed/missed mutation in production is simulated by manually clearing a
    # managed attribute: observer ignores attribute changes, heartbeat must restore.
    page.evaluate("document.querySelector('#initial').removeAttribute('data-chatgpt-rtl-dir')")
    page.wait_for_function("document.querySelector('#initial').dataset.chatgptRtlDir === 'rtl'", timeout=5500)
    status=page.evaluate('window.__getStatus()')
    assert status['reconcileRuns']>=1
    print('PASS self-recovery after missed update')

    # Rebuild the actual documentElement; previous observer watches a disconnected root.
    # No popup sync call: periodic reconciliation must rescan and reattach to current root.
    page.evaluate('''() => {
      const html=document.createElement('html');
      html.innerHTML='<head></head><body><main><div><p id="replaced">جایگزین جدید</p></div></main></body>';
      document.replaceChild(html, document.documentElement);
    }''')
    page.wait_for_function("document.querySelector('#replaced')?.dataset.chatgptRtlDir === 'rtl'", timeout=6500)
    status=page.evaluate('window.__getStatus()')
    assert page.evaluate("document.documentElement.getAttribute('data-chatgpt-rtl-active')") == 'true'
    assert page.locator('#chatgpt-rtl-support-style').count() == 1
    assert page.locator('#replaced').evaluate('(e)=>getComputedStyle(e).textAlign') == 'right'
    assert status['autoReconcileActive'] and status['mainMarked']>=1
    page.evaluate("document.querySelector('main').insertAdjacentHTML('beforeend','<p id=\"after-root\">ادامه گفتگو</p>')")
    page.wait_for_function("document.querySelector('#after-root')?.dataset.chatgptRtlDir === 'rtl'", timeout=5500)
    print('PASS root-replacement reconnect, continued new messages')

    # OFF must cancel heartbeat and clean managed attributes.
    page.evaluate('window.__toggle(false)')
    assert attr('#replaced') is None
    assert not page.evaluate('window.__getStatus().autoReconcileActive')
    page.evaluate("document.querySelector('main').insertAdjacentHTML('beforeend','<p id=\"off\">متن در حالت خاموش</p>')")
    page.wait_for_timeout(3600)
    assert attr('#off') is None
    page.evaluate('window.__toggle(true)')
    assert attr('#off')=='rtl'
    assert errors==[],errors
    print('PASS Off cleanup/no polling, re-enable and apply without popup')
    browser.close()

if __name__=='__main__':
  test_no_popup_and_recovery()
