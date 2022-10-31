**What is browser-storage-x ?**

It's a browser extension for chrome based/firefox/safari browsers which lets you copy localstorage/sessionstorage/cookies across different domains.


**Extension links**
- Chrome - https://chrome.google.com/webstore/detail/storagex/pafddkhaocklakonboekmgodcmgmfcbp
- Firefox - https://addons.mozilla.org/en-US/firefox/addon/storagex/


**Setup**

- This project uses `yarn`, so make sure to have that globally installed
- Check package.json and use the correct "engines" version locally, which includes _node_ and _yarn_ versions
- Run `yarn install`. This will install packages and additionally create a _tmp_ profile folder
- Run `yarn build` to build the extension. The extension can be found in _dist\[BROWSER]_ directory. Install this locally in your browser
- Test the extension (StorageX) that in now available in your browser
