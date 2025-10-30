document.addEventListener('DOMContentLoaded', () => {
  const websiteInput = document.getElementById('website-input');
  const redirectInput = document.getElementById('redirect-input');
  const addButton = document.getElementById('add-button');
  const blockedList = document.getElementById('blocked-list');

  // Load blocked websites from storage and display them
  chrome.storage.sync.get('blockedWebsites', (data) => {
    const blockedWebsites = data.blockedWebsites || [];
    blockedWebsites.forEach(renderBlockedWebsite);
  });

  addButton.addEventListener('click', () => {
    const website = websiteInput.value.trim();
    const redirect = redirectInput.value.trim();
    if (website) {
      chrome.storage.sync.get('blockedWebsites', (data) => {
        const blockedWebsites = data.blockedWebsites || [];
        blockedWebsites.push({ website, redirect });
        chrome.storage.sync.set({ blockedWebsites }, () => {
          renderBlockedWebsite({ website, redirect });
          websiteInput.value = '';
          redirectInput.value = '';
        });
      });
    }
  });

  function renderBlockedWebsite(item) {
    const listItem = document.createElement('li');
    listItem.textContent = `${item.website} ${item.redirect ? `-> ${item.redirect}` : ''}`;
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      chrome.storage.sync.get('blockedWebsites', (data) => {
        const blockedWebsites = data.blockedWebsites || [];
        const updatedBlockedWebsites = blockedWebsites.filter(
          (blockedItem) => blockedItem.website !== item.website
        );
        chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites }, () => {
          listItem.remove();
        });
      });
    });
    listItem.appendChild(removeButton);
    blockedList.appendChild(listItem);
  }
});