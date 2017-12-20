(function() {
  var meta = document.createElement('meta');
  document.head.appendChild(meta);

  var browser = window.browser || window.chrome;
  var safari = window.safari;

  if(browser) {
    meta.setAttribute('extension', browser.runtime.getManifest().name);
    meta.setAttribute('version', browser.runtime.getManifest().version);
  } else if(safari) {
    meta.setAttribute('extension', safari.extension.displayName);
    meta.setAttribute('version', safari.extension.displayVersion);
  }
})();
