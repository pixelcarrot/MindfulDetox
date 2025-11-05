document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('blockedScreenImage', (data) => {
    if (data.blockedScreenImage) {
      const blockedImage = document.querySelector('.container img');
      if (blockedImage) {
        blockedImage.src = data.blockedScreenImage;
      }
    }
  });
});
