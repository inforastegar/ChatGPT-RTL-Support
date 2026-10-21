/* Local installed font picker: Chrome fontSettings API (Manifest V3). */
(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', async () => {
    const button = document.querySelector('.button');
    const eye = document.querySelector('.eye');
    const notice = document.querySelector('.messageAlert');
    const fonts = document.getElementById('font-choice');
    const systemFonts = document.getElementById('system-font-group');
    const renderFontSource = () => { fonts.dataset.source = fonts.value === 'default' ? 'default' : 'system'; };
    const sizeInput = document.getElementById('font-size');
    const sizeLabel = document.getElementById('font-size-value');
    const reset = document.getElementById('font-size-reset');
    const sidebarSelect = document.getElementById('sidebar-direction');
    let activeTabId = null;
    const normalizeSize = value => Number.isInteger(Number(value)) && +value >= 12 && +value <= 28 ? +value : 0;
    const render = enabled => {
      button.dataset.enabled = String(enabled);
      button.setAttribute('aria-checked', String(enabled));
      button.setAttribute('aria-label', enabled ? 'Disable RTL' : 'Enable RTL');
      eye.textContent = enabled ? '📡' : '🤖';
    };
    const renderSize = size => {
      const value = normalizeSize(size);
      sizeInput.value = String(value || 16);
      sizeLabel.textContent = value ? value + ' px' : 'Default';
      sizeLabel.dataset.value = String(value);
    };
    async function sync() {
      if (!activeTabId) return;
      try {
        const state = await chrome.storage.local.get({buttonOn:false, fontChoice:'default', fontSize:0, sidebarDirection:'auto'});
        try { await chrome.tabs.sendMessage(activeTabId, {type:'chatgpt-rtl-ping'}); }
        catch { await chrome.scripting.executeScript({target:{tabId:activeTabId}, files:['content.js']}); }
        await chrome.tabs.sendMessage(activeTabId, {
          type:'chatgpt-rtl-sync', enabled:state.buttonOn === true,
          font:state.fontChoice, fontSize:normalizeSize(state.fontSize), sidebarDirection:state.sidebarDirection
        });
        notice.textContent = '';
      } catch (e) { notice.textContent = 'Reload ChatGPT to apply changes.'; console.warn(e); }
    }
    try {
      const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
      if (tab && /^https:\/\/(chatgpt\.com|chat\.openai\.com)(\/|$)/i.test(tab.url || '')) activeTabId = tab.id;
      else { button.disabled = true; notice.textContent = 'Open chatgpt.com to enable RTL.'; }
      const state = await chrome.storage.local.get({buttonOn:false,fontChoice:'default',fontSize:0,sidebarDirection:'auto'});
      render(state.buttonOn === true);
      renderSize(state.fontSize);
      sidebarSelect.value = ['auto','rtl','ltr'].includes(state.sidebarDirection) ? state.sidebarDirection : 'auto';
      let installed = [];
      try { installed = await chrome.fontSettings.getFontList(); }
      catch (e) { notice.textContent = 'Cannot read installed fonts. Reload the extension.'; console.warn(e); }
      const names = [...new Set(installed.map(f => f.fontId).filter(Boolean))].sort((a,b) => a.localeCompare(b));
      for (const name of names) systemFonts.appendChild(new Option(name, name));
      // Keep legacy preference if available; otherwise gracefully use default.
      const previous = state.fontChoice === 'b-nazanin' ? names.find(n => /^(b ?nazanin)$/i.test(n)) : state.fontChoice;
      fonts.value = names.includes(previous) ? previous : 'default';
      renderFontSource();
      if (fonts.value !== state.fontChoice) await chrome.storage.local.set({fontChoice:fonts.value});
      if (activeTabId) await sync();
    } catch(e) { notice.textContent = 'Extension initialization failed.'; console.error(e); }
    button.classList.add('initialized');
    sidebarSelect.addEventListener('change', async () => {
      await chrome.storage.local.set({sidebarDirection:sidebarSelect.value});
      await sync();
    });
    fonts.addEventListener('change', async () => {
      renderFontSource();
      await chrome.storage.local.set({fontChoice:fonts.value});
      await sync();
    });
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      const next = button.dataset.enabled !== 'true';
      await chrome.storage.local.set({buttonOn:next});
      render(next);
      await sync();
    });
    sizeInput.addEventListener('input', () => {
      renderSize(sizeInput.value);
      if (activeTabId) chrome.tabs.sendMessage(activeTabId, {
        type:'chatgpt-rtl-sync',
        enabled: button.dataset.enabled === 'true',
        font:fonts.value, fontSize:normalizeSize(sizeInput.value), sidebarDirection:sidebarSelect.value
      }).catch(()=>{});
    });
    sizeInput.addEventListener('change', async () => {
      await chrome.storage.local.set({fontSize:normalizeSize(sizeInput.value)});
      await sync();
    });
    reset.addEventListener('click', async () => {
      renderSize(0);
      await chrome.storage.local.set({fontSize:0});
      await sync();
    });
    chrome.storage.onChanged.addListener((changes,area) => {
      if(area !== 'local') return;
      if(changes.buttonOn) render(changes.buttonOn.newValue === true);
      if(changes.fontSize) renderSize(changes.fontSize.newValue);
      if(changes.sidebarDirection) sidebarSelect.value = changes.sidebarDirection.newValue;
      if(changes.fontChoice && [...fonts.options].some(o=>o.value===changes.fontChoice.newValue)) {
        fonts.value=changes.fontChoice.newValue;
        renderFontSource();
      }
    });
  });
})();
