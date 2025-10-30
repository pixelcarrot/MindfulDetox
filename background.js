const updateRules = () => {
  chrome.storage.sync.get('blockedWebsites', (data) => {
    const blockedWebsites = data.blockedWebsites || [];
    const rules = blockedWebsites.map((item, index) => {
      // Properly format the website URL for the URL constructor
      let websiteUrl;
      try {
        // If the website already has a protocol, use it as is
        if (item.website.startsWith('http://') || item.website.startsWith('https://')) {
          websiteUrl = new URL(item.website);
        } else {
          // Add https:// protocol if not present
          websiteUrl = new URL(`https://${item.website}`);
        }
      } catch (e) {
        // If URL construction fails, skip this item
        console.error(`Invalid website URL: ${item.website}`, e);
        return null;
      }
      
      return {
        id: index + 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { url: item.redirect || chrome.runtime.getURL('blocked.html') }
        },
        condition: {
          urlFilter: `||${websiteUrl.hostname}`,
          resourceTypes: ['main_frame']
        }
      };
    }).filter(rule => rule !== null); // Remove any null entries

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: Array.from({ length: 50 }, (_, i) => i + 1), // Remove existing rules
      addRules: rules
    });
    
    // Delete all history entries for blocked websites when the list is updated
    blockedWebsites.forEach(item => {
      try {
        // Format the website URL properly for history deletion
        let websiteHostname;
        if (item.website.startsWith('http://') || item.website.startsWith('https://')) {
          websiteHostname = new URL(item.website).hostname;
        } else {
          websiteHostname = new URL(`https://${item.website}`).hostname;
        }
        
        // Search for all history entries matching the hostname and delete them
        chrome.history.search({
          text: websiteHostname,
          startTime: 0,
          maxResults: 1000000  // Maximum number of results to ensure we get everything
        }, (results) => {
          results.forEach((historyItem) => {
            if (historyItem.url.includes(websiteHostname)) {
              chrome.history.deleteUrl({ url: historyItem.url });
            }
          });
        });
      } catch (e) {
        console.error(`Error processing website for history deletion: ${item.website}`, e);
      }
    });
  });
};

// Additional listener to delete history when blocked sites are accessed
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) { // Only for main frame navigation
    chrome.storage.sync.get('blockedWebsites', (data) => {
      const blockedWebsites = data.blockedWebsites || [];
      const url = new URL(details.url);
      const blockedSite = blockedWebsites.find((item) => {
        try {
          // Properly format the website URL for comparison
          let websiteHostname;
          if (item.website.startsWith('http://') || item.website.startsWith('https://')) {
            websiteHostname = new URL(item.website).hostname;
          } else {
            websiteHostname = new URL(`https://${item.website}`).hostname;
          }
          return url.hostname.includes(websiteHostname);
        } catch (e) {
          console.error(`Invalid website URL for comparison: ${item.website}`, e);
          return false;
        }
      });

      if (blockedSite) {
        // Remove the URL from history when a blocked site is accessed
        chrome.history.deleteUrl({ url: details.url });
      }
    });
  }
}, { url: [{ schemes: ['http', 'https'] }] });

chrome.runtime.onInstalled.addListener(() => {
  updateRules();
});

chrome.storage.onChanged.addListener(() => {
  updateRules();
});