document.addEventListener('DOMContentLoaded', () => {
  // Check for a custom blocked screen image.
  // If a custom image is set, replace the default logo with it.
  // Otherwise, the default logo from blocked.html will be used.
  chrome.storage.local.get('blockedScreenImage', (data) => {
    if (data.blockedScreenImage) {
      const blockedImage = document.getElementById('logo');
      if (blockedImage) {
        blockedImage.src = data.blockedScreenImage;
      }
    }
  });
});
