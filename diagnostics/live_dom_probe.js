/* Read-only live DOM probe. Never logs text, URLs, or HTML. */
(() => {
  const selectors = {
    messages: '[data-message-author-role]',
    turns: '[data-testid^="conversation-turn"]',
    otherMessage: '[data-testid="message"]',
    markdown: '.markdown',
    prose: '.prose',
    userBlocks: '.whitespace-pre-wrap',
    paragraphs: 'main p',
    headings: 'main h1,main h2,main h3,main h4,main h5,main h6',
    mainMarked: 'main [data-chatgpt-rtl-dir]',
    allMarked: '[data-chatgpt-rtl-dir]',
    sidebar: 'nav a[href*="/c/"],aside a[href*="/c/"]',
    frames: 'iframe'
  };
  const count = s => document.querySelectorAll(s).length;
  const allow = (el, attribute) => {
    const value = el.getAttribute(attribute) || '';
    if (attribute === 'data-testid') return /^(conversation-turn|message|user-message|assistant)/.test(value) ? value.slice(0,48) : null;
    if (attribute === 'data-message-author-role') return ['user','assistant','system'].includes(value) ? value : null;
    return /^[a-zA-Z-]{1,30}$/.test(value) ? value : null;
  };
  const shape = el => ({
    tag: el.tagName.toLowerCase(),
    role: allow(el,'role'),
    testId: allow(el,'data-testid'),
    author: allow(el,'data-message-author-role'),
    classes: ['markdown','prose','whitespace-pre-wrap','text-base','ProseMirror'].filter(c=>el.classList.contains(c)),
    rtlMark: el.getAttribute('data-chatgpt-rtl-dir')
  });
  const selected = typeof $0 !== 'undefined' && $0 instanceof Element ? $0 : null;
  const rtl = /[\u0590-\u05ff\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/;
  const visible = el => {
    const r=el.getBoundingClientRect();
    return r.width>0 && r.height>0 && r.bottom>0 && r.top<innerHeight;
  };
  const target = selected || [...document.querySelectorAll('main p,main h1,main h2,main h3,main li')]
    .find(el=>visible(el)&&rtl.test(el.textContent||'')) || null;
  const ancestry=[];
  for(let el=target,depth=0;el&&depth<12;el=el.parentElement,depth++)
    ancestry.push({depth,...shape(el)});
  const computed = target ? getComputedStyle(target) : null;
  const style = document.getElementById('chatgpt-rtl-support-style');
  const result = {
    extensionEnabled: document.documentElement.getAttribute('data-chatgpt-rtl-active'),
    stylePresent: Boolean(style),
    cssRules: style?.sheet?.cssRules?.length ?? 0,
    counts: Object.fromEntries(Object.entries(selectors).map(([k,s])=>[k,count(s)])),
    target: target ? {...shape(target),
      computedDirection:computed.direction,
      computedAlign:computed.textAlign,
      computedUnicodeBidi:computed.unicodeBidi,
      inMain:!!target.closest('main'),
      inMessage:!!target.closest('[data-message-author-role],[data-testid^="conversation-turn"],article[data-turn-id]')
    }:null,
    selectedFromInspector:Boolean(selected),
    ancestry
  };
  console.log('ChatGPT RTL diagnostic (NO chat text):', JSON.stringify(result,null,2));
  return result;
})();