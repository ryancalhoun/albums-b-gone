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
