document.addEventListener('DOMContentLoaded', () => {
  const websiteInput = document.getElementById('website-input');
  const redirectInput = document.getElementById('redirect-input');
  const addButton = document.getElementById('add-button');
  const blockedList = document.getElementById('blocked-list');
  const editModal = document.getElementById('edit-modal');
  const redirectModal = document.getElementById('redirect-modal');
  const closeButtons = document.querySelectorAll('.close-button');
  const editWebsiteInput = document.getElementById('edit-website-input');
  const editRedirectInput = document.getElementById('edit-redirect-input');
  const saveButton = document.getElementById('save-button');
  const redirectToInput = document.getElementById('redirect-to-input');
  const redirectSaveButton = document.getElementById('redirect-save-button');

  let editingWebsite = null;
  let redirectItem = null;

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

    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');

    const dropDownButton = document.createElement('button');
    dropDownButton.textContent = 'Actions';
    dropDownButton.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllDropdowns();
      dropdownContent.classList.toggle('show');
    });

    const dropdownContent = document.createElement('div');
    dropdownContent.classList.add('dropdown-content');

    const editButton = document.createElement('a');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      editingWebsite = item;
      editWebsiteInput.value = item.website;
      editRedirectInput.value = item.redirect || '';
      editModal.style.display = 'block';
    });

    const redirectButton = document.createElement('a');
    redirectButton.textContent = 'Redirect';
    redirectButton.addEventListener('click', () => {
      redirectItem = item;
      redirectToInput.value = item.redirect || '';
      redirectModal.style.display = 'block';
    });

    const removeButton = document.createElement('a');
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

    dropdownContent.appendChild(editButton);
    dropdownContent.appendChild(redirectButton);
    dropdownContent.appendChild(removeButton);

    dropdown.appendChild(dropDownButton);
    dropdown.appendChild(dropdownContent);

    listItem.appendChild(dropdown);
    blockedList.appendChild(listItem);
  }

  function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-content');
    dropdowns.forEach(d => d.classList.remove('show'));
  }

  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      editModal.style.display = 'none';
      redirectModal.style.display = 'none';
    });
  });

  saveButton.addEventListener('click', () => {
    const newWebsite = editWebsiteInput.value.trim();
    const newRedirect = editRedirectInput.value.trim();
    if (newWebsite && editingWebsite) {
      chrome.storage.sync.get('blockedWebsites', (data) => {
        const blockedWebsites = data.blockedWebsites || [];
        const updatedBlockedWebsites = blockedWebsites.map((item) => {
          if (item.website === editingWebsite.website) {
            return { ...item, website: newWebsite, redirect: newRedirect };
          }
          return item;
        });
        chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites }, () => {
          blockedList.innerHTML = '';
          updatedBlockedWebsites.forEach(renderBlockedWebsite);
          editModal.style.display = 'none';
          editingWebsite = null;
        });
      });
    }
  });

  redirectSaveButton.addEventListener('click', () => {
    const newRedirect = redirectToInput.value.trim();
    if (redirectItem) {
      chrome.storage.sync.get('blockedWebsites', (data) => {
        const blockedWebsites = data.blockedWebsites || [];
        const updatedBlockedWebsites = blockedWebsites.map((item) => {
          if (item.website === redirectItem.website) {
            return { ...item, redirect: newRedirect };
          }
          return item;
        });
        chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites }, () => {
          blockedList.innerHTML = '';
          updatedBlockedWebsites.forEach(renderBlockedWebsite);
          redirectModal.style.display = 'none';
          redirectItem = null;
        });
      });
    }
  });

  window.addEventListener('click', (event) => {
    if (event.target == editModal) {
      editModal.style.display = 'none';
    } else if (event.target == redirectModal) {
      redirectModal.style.display = 'none';
    }
    if (!event.target.matches('.dropdown button')) {
      closeAllDropdowns();
    }
  });
});
