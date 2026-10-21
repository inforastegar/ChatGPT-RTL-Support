"""Regression: user's live DOM probe showed zero message wrappers, 104 p and 19 headings."""
from pathlib import Path
import os
from shutil import which
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
MOCK = """
window.savedRtl = true;
window.storageCallbacks = [];
window.msgCallback = null;
window.chrome = {
  runtime:{lastError:null,onMessage:{addListener:cb => window.msgCallback=cb}},
  storage:{onChanged:{addListener:cb => window.storageCallbacks.push(cb)},
    local:{get:(defaults,callback)=>callback({buttonOn:window.savedRtl})}}
};
window.rtlToggle = enabled => {
  window.savedRtl = enabled;
  for(const cb of window.storageCallbacks) cb({buttonOn:{newValue:enabled}}, 'local');
};
window.rtlStatus = () => {
 let result;
 window.msgCallback({type:'chatgpt-rtl-ping'}, {}, value=>result=value);
 return result;
};
void 0;
"""

def mark(page, sel):
    return page.locator(sel).get_attribute('data-chatgpt-rtl-dir')

def computed(page, sel, prop):
    return page.locator(sel).evaluate('(el,prop) => getComputedStyle(el)[prop]', prop)



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

def test_probe_shaped_dom():
    with sync_playwright() as playwright:
        browser = launch_test_chromium(playwright)
        page = browser.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        html = '<!doctype html><html><head><style>main p{text-align:justify;direction:rtl}</style></head><body>'
        html += '<nav><a href="/c/1"><span id="sidebar">عنوان گفتگو</span></a></nav>'
        html += '<main><header><h2 id="menu-title">عنوان منو</h2></header><div id="thread">'
        for i in range(104):
            value = '<span><span>پاراگراف فارسی</span></span>' if i == 0 else (
                'English paragraph' if i == 1 else 'متن فارسی')
            html += f'<div><div><p id="p{i}">{value}</p></div></div>'
        for i in range(19):
            html += f'<div><h3 id="h{i}">عنوان فارسی</h3></div>'
        html += ('<div id="user" class="whitespace-pre-wrap">پرامپت فارسی</div>'
                 '<pre id="pre"><code>const x = "سلام";</code></pre>'
                 '<form><p id="form-p">متن فرم</p><textarea>سلام</textarea></form>'
                 '</div></main></body></html>')
        page.set_content(html)
        page.evaluate(MOCK)
        page.add_script_tag(path=str(ROOT / 'content.js'))
        assert not errors, errors
        assert page.locator('[data-message-author-role],[data-testid^="conversation-turn"]').count() == 0
        assert page.locator('main p').count() == 105
        assert page.locator('main h3').count() == 19
        assert mark(page,'#p0') == 'rtl'
        assert computed(page,'#p0','textAlign') == 'right'
        assert mark(page,'#p1') == 'ltr'
        assert computed(page,'#p1','textAlign') == 'left'
        assert mark(page,'#h0') == 'rtl'
        assert computed(page,'#h0','textAlign') == 'right'
        assert mark(page,'#user') == 'rtl'
        assert mark(page,'#form-p') is None
        assert mark(page,'#menu-title') is None
        assert mark(page,'#pre') is None
        assert computed(page,'#pre','direction') == 'ltr'
        report = page.evaluate('window.rtlStatus()')
        assert report['messages'] == 0 and report['mainBlocks'] >= 123, report
        assert report['mainMarked'] >= 124, report

        page.evaluate("""() => document.querySelector('#thread').insertAdjacentHTML(
          'beforeend', '<div><p id="fresh">پاسخ جدید</p><h2 id="fresh-title">عنوان جدید</h2></div>')""")
        page.wait_for_timeout(170)
        assert mark(page,'#fresh') == 'rtl'
        assert mark(page,'#fresh-title') == 'rtl'
        page.evaluate("document.querySelector('#fresh').firstChild.textContent='Hello world'")
        page.wait_for_timeout(170)
        assert mark(page,'#fresh') == 'ltr'
        page.evaluate("document.querySelector('#fresh').firstChild.textContent='پاسخ فارسی'")
        page.wait_for_timeout(170)
        assert mark(page,'#fresh') == 'rtl'

        page.evaluate("""() => {
            document.querySelector('#thread').remove();
            document.querySelector('main').insertAdjacentHTML('beforeend',
              '<div id="thread"><p id="next-chat">پیام دوم</p></div>');
        }""")
        page.wait_for_timeout(170)
        assert mark(page,'#next-chat') == 'rtl'
        page.evaluate('window.rtlToggle(false)')
        assert mark(page,'#next-chat') is None
        assert page.locator('#chatgpt-rtl-support-style').count() == 0
        page.evaluate('window.rtlToggle(true)')
        assert mark(page,'#next-chat') == 'rtl'
        assert errors == [], errors
        browser.close()

if __name__ == '__main__':
    test_probe_shaped_dom()
    print('PASS: wrapperless main / streaming / SPA navigation / On-Off / technical exclusions')
