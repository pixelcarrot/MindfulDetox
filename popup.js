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
  const exportButton = document.getElementById('export-button');
  const importButton = document.getElementById('import-button');
  const importFileInput = document.getElementById('import-file-input');
  const imageUploadInput = document.getElementById('image-upload-input');
  const saveImageButton = document.getElementById('save-image-button');

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
    
    const websiteText = document.createElement('span');
    websiteText.classList.add('website-text');
    websiteText.textContent = `${item.website} ${item.redirect ? `-> ${item.redirect}` : ''}`;
    websiteText.title = `${item.website} ${item.redirect ? `-> ${item.redirect}` : ''}`;  // Tooltip for full text
    
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

    listItem.appendChild(websiteText);
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

  // Export functionality
  exportButton.addEventListener('click', () => {
    chrome.storage.sync.get('blockedWebsites', (data) => {
      const blockedWebsites = data.blockedWebsites || [];
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        blockedWebsites: blockedWebsites
      };
      
      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `detox-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  });

  // Import functionality
  importButton.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          // Validate backup data structure
          if (!backupData.blockedWebsites || !Array.isArray(backupData.blockedWebsites)) {
            alert('Invalid backup file format.');
            return;
          }
          
          // Get current blocked websites count for confirmation
          chrome.storage.sync.get('blockedWebsites', (data) => {
            const currentCount = (data.blockedWebsites || []).length;
            const confirmMsg = `This will replace your current ${currentCount} blocked website(s) with ${backupData.blockedWebsites.length} from the backup. Continue?`;
            
            if (confirm(confirmMsg)) {
              chrome.storage.sync.set({ blockedWebsites: backupData.blockedWebsites }, () => {
                blockedList.innerHTML = '';
                backupData.blockedWebsites.forEach(renderBlockedWebsite);
                alert('Backup imported successfully!');
              });
            }
          });
        } catch (error) {
          alert('Error reading backup file: ' + error.message);
        }
      };
      reader.readAsText(file);
      // Reset file input so the same file can be selected again if needed
      event.target.value = '';
    }
  });

  saveImageButton.addEventListener('click', () => {
    const file = imageUploadInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        chrome.storage.local.set({ blockedScreenImage: e.target.result }, () => {
          alert('Blocked screen image saved!');
        });
      };
      reader.readAsDataURL(file);
    }
  });
});
