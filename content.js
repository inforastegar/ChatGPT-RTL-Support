/* ChatGPT RTL Support — dynamic page script, independent of the popup. */
(() => {
  "use strict";
  const INSTANCE_KEY = "__chatgptRtlSupportV163";
  if (globalThis[INSTANCE_KEY]) return;
  globalThis[INSTANCE_KEY] = true;

  const STYLE_ID = "chatgpt-rtl-support-style";
  const DIR_ATTR = "data-chatgpt-rtl-dir";
  const ROOT_ATTR = "data-chatgpt-rtl-active";
  const FONT_ATTR = "data-chatgpt-rtl-font";

  let selectedFont = "default";
  let selectedSize = 0; // 0 preserves ChatGPT original size.
  let sidebarDirection = "auto";
  const SIDEBAR_TITLE = 'nav a[href*="/c/"], aside a[href*="/c/"]';

  const MESSAGE = [
    '[data-message-author-role]',
    '[data-testid^="conversation-turn"]',
    'article[data-turn-id]',
    '[data-testid="user-message"]'
  ].join(',');
  const BLOCKS = [
    '.markdown', '.prose', '.whitespace-pre-wrap',
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'li', 'blockquote', 'th', 'td', 'dt', 'dd',
    '[data-testid="user-message"]'
  ].join(',');
  // Actual Chrome DOM probe (2026-10-20): no semantic message wrappers,
  // but 104 paragraphs and 19 headings under main. Use block-level fallback.
  const FALLBACK_BLOCKS = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote',
    'dd', 'dt', 'figcaption', 'th', 'td', '.whitespace-pre-wrap'
  ].join(',');
  const EXCLUDED_CONTENT = [
    'nav', 'aside', 'header', 'footer', 'form', 'button',
    '[role="button"]', '[role="dialog"]', '[role="menu"]', '[role="tablist"]',
    '[contenteditable]', 'textarea', 'input', 'pre', 'code',
    'math', '.katex', '.katex-display', '.MathJax'
  ].join(',');
  const COMPOSERS = '[contenteditable="true"][data-placeholder], .ProseMirror[contenteditable="true"], #prompt-textarea, textarea';
  const RTL = /[\u0590-\u05ff\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/;
  const LTR = /[A-Za-z]/;
  let enabled = false;
  let observer = null;
  let observedRoot = null;
  let reconcileTimer = null;
  let reconcileRuns = 0;
  let mutationBatches = 0;
  const RECONCILE_INTERVAL_MS = 3000;
  let flushTimer = null;
  const pending = new Set();

  function directionFor(text) {
    return RTL.test(text) ? 'rtl' : (LTR.test(text) ? 'ltr' : null);
  }

  function mark(el) {
    if (!(el instanceof Element) || !el.isConnected || el.closest('pre, code, .katex, .katex-display')) return;
    const dir = directionFor(el.textContent || '');
    if (dir) {
      if (el.getAttribute(DIR_ATTR) !== dir) el.setAttribute(DIR_ATTR, dir);
    } else {
      el.removeAttribute(DIR_ATTR);
    }
  }

  function isContentBlock(el) {
    return el instanceof Element && el.isConnected &&
      Boolean(el.closest('main')) && !el.closest(EXCLUDED_CONTENT);
  }

  function markMainBlock(el) {
    if (isContentBlock(el) && el.matches(FALLBACK_BLOCKS)) mark(el);
  }

  function scanMain(node) {
    if (!(node instanceof Element) || !node.isConnected) return;
    // When a text node changes during streaming, scan its nearest block.
    // In modern ChatGPT there may be NO message wrapper or .markdown at all.
    if (node.closest('main')) {
      markMainBlock(node.closest(FALLBACK_BLOCKS));
      markMainBlock(node);
      node.querySelectorAll(FALLBACK_BLOCKS).forEach(markMainBlock);
    } else if (node.matches('main')) {
      node.querySelectorAll(FALLBACK_BLOCKS).forEach(markMainBlock);
    } else {
      node.querySelectorAll('main').forEach(main =>
        main.querySelectorAll(FALLBACK_BLOCKS).forEach(markMainBlock));
    }
  }

  function processMessage(message) {
    if (!message.isConnected) return;
    // Mark the message itself as a fallback when ChatGPT changes its inner markup.
    mark(message);
    message.querySelectorAll(BLOCKS).forEach(mark);
  }

  function processNode(node) {
    if (!(node instanceof Element) || !node.isConnected) return;
    const message = node.closest(MESSAGE);
    if (message) {
      // Handle a streaming text change as well as newly appended markup.
      processMessage(message);
    } else {
      if (node.matches(MESSAGE)) processMessage(node);
      node.querySelectorAll(MESSAGE).forEach(processMessage);
    }
    scanMain(node);
    if (node.matches(COMPOSERS)) mark(node);
    node.querySelectorAll(COMPOSERS).forEach(mark);
    if (node.matches(SIDEBAR_TITLE)) applySidebarDirection(node);
    node.querySelectorAll(SIDEBAR_TITLE).forEach(applySidebarDirection);
  }

  function flush() {
    flushTimer = null;
    if (!enabled) return;
    const elements = Array.from(pending);
    pending.clear();
    // Avoid repeatedly processing a whole message for every changed child.
    const messages = new Set();
    for (const el of elements) {
      if (!el.isConnected) continue;
      const message = el.closest(MESSAGE);
      if (message) messages.add(message);
      else processNode(el);
    }
    messages.forEach(message => {
      processMessage(message);
      // A semantic wrapper may appear at any time. Do not let the optimized
      // message route bypass the wrapperless main-block fallback.
      scanMain(message);
    });
  }

  function enqueue(node) {
    if (!enabled || !(node instanceof Element)) return;
    pending.add(node);
    if (flushTimer === null) flushTimer = setTimeout(flush, 70);
  }

  function addStyles() {
    let sheet = document.getElementById(STYLE_ID);
    if (sheet) return;
    if (!sheet) {
      sheet = document.createElement('style');
      sheet.id = STYLE_ID;
    }
    sheet.id = STYLE_ID;
    sheet.textContent = `
      html[${ROOT_ATTR}="true"] [${DIR_ATTR}="rtl"] { direction: rtl !important; text-align: right !important; }
      html[${ROOT_ATTR}="true"] [${DIR_ATTR}="ltr"] { direction: ltr !important; text-align: left !important; }
      html[${ROOT_ATTR}="true"] :is([data-message-author-role], [data-testid^="conversation-turn"], article[data-turn-id]) :is(h1,h2,h3,h4,h5,h6)[${DIR_ATTR}="rtl"] { text-align: right !important; }
      html[${ROOT_ATTR}="true"][${FONT_ATTR}="custom"] main [${DIR_ATTR}="rtl"]:not(pre):not(code):not(.katex):not(.MathJax) { font-family: var(--chatgpt-rtl-selected-font, inherit) !important; }
      html[${ROOT_ATTR}="true"][data-chatgpt-rtl-size]:not([data-chatgpt-rtl-size="0"]) main [${DIR_ATTR}="rtl"]:is(p,li,blockquote,dd,dt,figcaption,th,td,.whitespace-pre-wrap,[data-testid="user-message"]) { font-size: var(--chatgpt-rtl-font-size) !important; }
      /* Only align the sidebar title link; never alter typography, dimensions, or icons. */
      html[${ROOT_ATTR}="true"] :is(nav, aside) a[href*="/c/"][data-chatgpt-sidebar-align="rtl"] { text-align: right !important; }
      html[${ROOT_ATTR}="true"] :is(nav, aside) a[href*="/c/"][data-chatgpt-sidebar-align="ltr"] { text-align: left !important; }
      html[${ROOT_ATTR}="true"] main pre,
      html[${ROOT_ATTR}="true"] main pre * { direction: ltr !important; text-align: left !important; }
      html[${ROOT_ATTR}="true"] main :is(code,.katex,.katex-display,.MathJax,math) { direction: ltr !important; unicode-bidi: isolate; }
    `;
    (document.head || document.documentElement).appendChild(sheet);
  }

  function refreshAll() {
    document.querySelectorAll(MESSAGE).forEach(processMessage);
    document.querySelectorAll('main').forEach(scanMain);
    document.querySelectorAll(COMPOSERS).forEach(mark);
    document.querySelectorAll(SIDEBAR_TITLE).forEach(applySidebarDirection);

  }

  function startObserving() {
    // If the app replaced the observed document root, restore observation.
    if (observer && observedRoot === document.documentElement && observedRoot.isConnected) return;
    observer?.disconnect();
    const root = document.documentElement;
    if (!root) return;
    observer = new MutationObserver(records => {
      mutationBatches++;
      for (const record of records) {
        if (record.type === 'characterData') {
          enqueue(record.target.parentElement);
        } else {
          if (record.target instanceof Element && record.target.closest('main')) enqueue(record.target);
          for (const node of record.addedNodes) {
            if (node instanceof Element) enqueue(node);
            else if (node.nodeType === Node.TEXT_NODE) enqueue(node.parentElement);
          }
        }
      }
    });
    observer.observe(root, {subtree: true, childList: true, characterData: true});
    observedRoot = root;
  }

  function reconcile() {
    if (!enabled || document.visibilityState === 'hidden') return;
    startObserving();
    if (document.documentElement.getAttribute(ROOT_ATTR) !== 'true') {
      document.documentElement.setAttribute(ROOT_ATTR, 'true');
    }
    addStyles();
    refreshAll();
    reconcileRuns++;
  }

  function onPageReturn() {
    // popup used to call refreshAll through chatgpt-rtl-sync. Make that
    // reconciliation automatic for navigation/focus and missed mutations.
    reconcile();
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') reconcile();
  }

  function startAutoReconcile() {
    if (reconcileTimer !== null) return;
    window.addEventListener('focus', onPageReturn);
    window.addEventListener('pageshow', onPageReturn);
    window.addEventListener('popstate', onPageReturn);
    document.addEventListener('visibilitychange', onVisibilityChange);
    reconcileTimer = window.setInterval(reconcile, RECONCILE_INTERVAL_MS);
  }

  function stopAutoReconcile() {
    if (reconcileTimer !== null) window.clearInterval(reconcileTimer);
    reconcileTimer = null;
    window.removeEventListener('focus', onPageReturn);
    window.removeEventListener('pageshow', onPageReturn);
    window.removeEventListener('popstate', onPageReturn);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  }

  function onInput(event) {
    const el = event.target instanceof Element ? event.target.closest(COMPOSERS) : null;
    if (el) enqueue(el);
  }

  function setFont(value) {
    // Font names are supplied by Chrome fontSettings; CSS escaping via JSON string literal.
    selectedFont = typeof value === 'string' && value.length <= 160 ? value : 'default';
    const root = document.documentElement;
    root.setAttribute(FONT_ATTR, selectedFont === 'default' ? 'default' : 'custom');
    if (selectedFont === 'default') root.style.removeProperty('--chatgpt-rtl-selected-font');
    else root.style.setProperty('--chatgpt-rtl-selected-font', JSON.stringify(selectedFont));
  }

  function setSize(value) {
    const number = Number(value);
    selectedSize = Number.isInteger(number) && number >= 12 && number <= 28 ? number : 0;
    const root = document.documentElement;
    root.setAttribute("data-chatgpt-rtl-size", String(selectedSize));
    if (selectedSize) root.style.setProperty("--chatgpt-rtl-font-size", `${selectedSize}px`);
    else root.style.removeProperty("--chatgpt-rtl-font-size");
  }

  function applySidebarDirection(link) {
    if (!(link instanceof Element)) return;
    if (!enabled || sidebarDirection === "auto") {
      link.removeAttribute("data-chatgpt-sidebar-align");
      return;
    }
    const direction = sidebarDirection === "rtl" ? "rtl" : "ltr";
    link.setAttribute("data-chatgpt-sidebar-align", direction);
  }

  function setSidebarDirection(value) {
    sidebarDirection = ["auto", "rtl", "ltr"].includes(value) ? value : "auto";
    document.querySelectorAll(SIDEBAR_TITLE).forEach(applySidebarDirection);
  }

  function setEnabled(next) {
    if (next === enabled) {
      if (enabled) refreshAll();
      return;
    }
    enabled = next;
    if (enabled) {
      document.documentElement.setAttribute(ROOT_ATTR, 'true');
      addStyles();
      refreshAll();
      startObserving();
      document.addEventListener('input', onInput, true);
      startAutoReconcile();
    } else {
      stopAutoReconcile();
      observer?.disconnect(); observer = null; observedRoot = null;
      document.removeEventListener('input', onInput, true);
      if (flushTimer !== null) clearTimeout(flushTimer);
      flushTimer = null;
      pending.clear();
      document.getElementById(STYLE_ID)?.remove();
      document.documentElement.removeAttribute(ROOT_ATTR);
      document.querySelectorAll(`[${DIR_ATTR}]`).forEach(el => el.removeAttribute(DIR_ATTR));
      document.querySelectorAll('[data-chatgpt-sidebar-align]').forEach(el => el.removeAttribute('data-chatgpt-sidebar-align'));
    }
  }

  function status() {
    return {ok: true, enabled, messages: document.querySelectorAll(MESSAGE).length,
      mainBlocks: document.querySelectorAll('main p,main h1,main h2,main h3,main h4,main h5,main h6').length,
      mainMarked: document.querySelectorAll(`main [${DIR_ATTR}]`).length,
      marked: document.querySelectorAll(`[${DIR_ATTR}]`).length,
      reconcileRuns, mutationBatches, autoReconcileActive: reconcileTimer !== null, font: selectedFont, fontSize: selectedSize, sidebarDirection, version: '1.6.3'};
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'chatgpt-rtl-ping') {
      sendResponse(status());
    } else if (message?.type === 'chatgpt-rtl-sync') {
      if (message.font !== undefined) setFont(message.font);
      if (message.fontSize !== undefined) setSize(message.fontSize);
      if (message.sidebarDirection !== undefined) setSidebarDirection(message.sidebarDirection);
      setEnabled(message.enabled === true);
      sendResponse(status());
    }
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.fontChoice) setFont(changes.fontChoice.newValue);
    if (changes.fontSize) setSize(changes.fontSize.newValue);
    if (changes.sidebarDirection) setSidebarDirection(changes.sidebarDirection.newValue);
    if (changes.buttonOn) setEnabled(changes.buttonOn.newValue === true);
  });
  chrome.storage.local.get({buttonOn: false, fontChoice: 'default', fontSize: 0, sidebarDirection: 'auto'}, data => {
    if (!chrome.runtime.lastError) {
      setFont(data.fontChoice);
      setSize(data.fontSize);
      setSidebarDirection(data.sidebarDirection);
      setEnabled(data.buttonOn === true);
    }
    else console.warn('[ChatGPT RTL] Storage error:', chrome.runtime.lastError.message);
  });
})();
