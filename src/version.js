var meta = document.createElement('meta');
if(!window.browser && window.chrome) {
  window.browser = window.chrome;
}

document.head.appendChild(meta);
meta.setAttribute('extension', browser.runtime.getManifest().name);
meta.setAttribute('version', browser.runtime.getManifest().version);
