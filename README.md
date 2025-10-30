# Project Overview

This project is a simple Chrome extension that allows users to block websites. Users can also specify a redirect URL for a blocked website. If no redirect URL is provided, a default "This site is blocked" message will be shown.

The extension is built using HTML, CSS, and JavaScript.

# Building and Running

To run this extension, follow these steps:

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable "Developer mode".
3.  Click on "Load unpacked" and select the directory containing this project.

The extension will be installed and ready to use.

# Development Conventions

The project follows a simple structure for a Chrome extension:

*   `manifest.json`: The manifest file that defines the extension's configuration, permissions, and files.
*   `popup.html`, `popup.css`, `popup.js`: These files implement the extension's popup UI, which allows users to add and remove websites from the blocklist.
*   `background.js`: This is the service worker that runs in the background and contains the core logic for blocking and redirecting websites.
*   `blocked.html`, `blocked.css`: These files are used to display a message when a user navigates to a blocked website without a specified redirect.

The code is written in plain JavaScript, HTML, and CSS. There are no external libraries or frameworks used.