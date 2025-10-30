const updateRules = () => {
  chrome.storage.sync.get('blockedWebsites', (data) => {
    const blockedWebsites = data.blockedWebsites || [];
    const rules = blockedWebsites.map((item, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { url: item.redirect || chrome.runtime.getURL('blocked.html') }
      },
      condition: {
        urlFilter: `||${new URL(item.website).hostname}`,
        resourceTypes: ['main_frame']
      }
    }));

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: Array.from({ length: 50 }, (_, i) => i + 1), // Remove existing rules
      addRules: rules
    });
  });
};

chrome.runtime.onInstalled.addListener(() => {
  updateRules();
});

chrome.storage.onChanged.addListener(() => {
  updateRules();
});