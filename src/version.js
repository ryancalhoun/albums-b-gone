var meta = document.createElement('meta');
document.head.appendChild(meta);
meta.setAttribute('extension', chrome.runtime.getManifest().name);
meta.setAttribute('version', chrome.runtime.getManifest().version);
