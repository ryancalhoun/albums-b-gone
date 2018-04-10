(function() {
  var meta = document.createElement('meta');
  document.head.appendChild(meta);

  var standardBrowser = window.browser || window.chrome;
  if(!standardBrowser && typeof browser == 'object')
    standardBrowser = browser;
  var safari = window.safari;

  if(standardBrowser) {
    meta.setAttribute('extension', standardBrowser.runtime.getManifest().name);
    meta.setAttribute('version', standardBrowser.runtime.getManifest().version);
  } else if(safari) {
    if(window.location.hostname == 'roerunner.com') {
      safari.self.addEventListener('message', function(event) {
        if(event.name == 'version') {
          meta.setAttribute('extension', event.message.name);
          meta.setAttribute('version', event.message.version);
        }
      });
      safari.self.tab.dispatchMessage('get-version');
    }
  }
})();
