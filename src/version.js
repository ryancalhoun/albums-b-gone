(function() {
  var meta = document.createElement('meta');
  document.head.appendChild(meta);

  var browser = window.browser || window.chrome;
  var safari = window.safari;

  if(browser) {
    meta.setAttribute('extension', browser.runtime.getManifest().name);
    meta.setAttribute('version', browser.runtime.getManifest().version);
  } else if(safari) {
    if(window.location.hostname == 'roerunner.com') {
      var http = new XMLHttpRequest();
      http.onreadystatechange = function() {
        if(http.readyState == XMLHttpRequest.DONE && http.status == 200) {

        }
      };


      safari.extension.baseURI + "Info.plist"
    }
    meta.setAttribute('extension', safari.extension.displayName);
    meta.setAttribute('version', safari.extension.displayVersion);
  }
})();
