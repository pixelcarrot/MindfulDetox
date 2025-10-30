chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  chrome.storage.sync.get('blockedWebsites', (data) => {
    const blockedWebsites = data.blockedWebsites || [];
    const url = new URL(details.url);
    const blockedSite = blockedWebsites.find((item) => url.hostname.includes(item.website));

    if (blockedSite) {
      if (blockedSite.redirect) {
        chrome.tabs.update(details.tabId, { url: blockedSite.redirect });
      } else {
        chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL('blocked.html') });
      }
    }
  });
}, { url: [{ schemes: ['http', 'https'] }] });