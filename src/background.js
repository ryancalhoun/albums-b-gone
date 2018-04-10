(function() {
  var key = 'roerunner-cleanit-facebook';

  var standardBrowser = window.browser || window.chrome;
  if(!standardBrowser && typeof browser == 'object')
    standardBrowser = browser;
  var safari = window.safari;

  var callback = {};

  window.updateState = updateState;

  if(standardBrowser) {
    standardBrowser.runtime.onMessage.addListener(function(message, sender, sendResponse){
      if(message == 'update-state') {
        updateState();
      }
    });
  } else [
    callback['get-version'] = function() {
      safari.application.activeBrowserWindow.activeTab.dispatchMessage('version', {
        name: safari.extension.displayName,
        version: safari.extension.displayVersion
      });
    };

    safari.application.addEventListener('message', function(event) {
      var cb = callback[event.name];
      if(cb)
        cb(event);
    });
  }

  var apiHost;

  function updateState() {

    if(standardBrowser) {
      standardBrowser.tabs.query({active: true, lastFocusedWindow: true}, function(array_of_Tabs) {
        var active = array_of_Tabs[0];
        if(active.url.indexOf('localhost') > -1) {
          apiHost = 'http://localhost:3000';
        } else {
          apiHost = 'https://api.roerunner.com';
        }
      });
    } else {
      apiHost = 'https://api.roerunner.com';
    }

    var data = {};

    var doRemove;

    try {
      data = JSON.parse(localStorage.getItem(key));
    } catch(e) {}

    if(data && data.running) {
      removeNext();
    }

    var tab;
    function removeNext() {
      if(!data || !data.running)
        return;

      if(data.list.length == 0) {
        data.running = false;
        return signalDisplay();
      }

      var id = data.list[0];
      doRemove = true;

      openTab(tab, id, function(t) {
        if(!tab) {
          var waitingForSuccess;
          attachListener(t, function(url) {
            if(doRemove && data.running) {
              if(url.indexOf(data.list[0] + "") > -1) {
                doRemove = false;
                signalTab(t, function(s) {
                  if(s == 'ok') {
                    waitingForSuccess = true;
                  }
                  if(s == 'not-found') {
                    onRemoveComplete();
                  }
                });
              }
            } else {
              if(waitingForSuccess && url.indexOf('/groups/') > -1) {
                waitingForSuccess = false;
                setTimeout(onRemoveComplete, 500);

                var http = new XMLHttpRequest();
                http.open('DELETE', apiHost + '/external/facebook_album/' + data.list[0]);
                http.send();
              }
            }
          });
        }
        tab = t;
      });
    }

    function onRemoveComplete() {
      console.log("Remove complete", data);
      data.list.shift();
      data.running = data.list.length > 0;

      localStorage.setItem(key, JSON.stringify(data));
      signalDisplay();

      if(data.running) {
        removeNext();
      } else {
        if(standardBrowser) {
          standardBrowser.tabs.remove(tab.id);
        } else if(safari) {
          tab.close();
        }
        signalDisplay();
      }
    }
  }

  function signalDisplay() {
    if(standardBrowser) {
      standardBrowser.runtime.sendMessage('update-display');
    } else if(safari) {
      safari.extension.popovers[0].contentWindow.updateDisplay();
    }
  }

  function openTab(tab, id, cb) {
    var url = 'https://www.facebook.com/media/set/edit/oa.' + id + '?mask=' + id;

    if(standardBrowser) {
      if(tab) {
        standardBrowser.tabs.update(tab.id, {url: url});
        cb(tab);
      } else {
        standardBrowser.tabs.query({active: true, lastFocusedWindow: true}, function(array_of_Tabs) {
          var active = array_of_Tabs[0];
          standardBrowser.tabs.create({url: url, index: active.index}, function(t) {
            cb(t);
          });
        });
      }
    } else if(safari) {
      if(!tab) {
        tab = safari.application.activeBrowserWindow.openTab();
      }
      tab.url = url;
      cb(tab);
    }
  }


  function signalTab(tab, cb) {
    if(standardBrowser) {
      standardBrowser.tabs.sendMessage(tab.id, 'remove', cb);
    } else if(safari) {
      callback['remove-status'] = function(event) {
        safari.application.removeEventListener('message', onResponse);
        cb(event.message);
      };

      tab.page.dispatchMessage('remove');
    }
  }

  function attachListener(tab, cb) {
    if(standardBrowser) {
      standardBrowser.tabs.onUpdated.addListener(function(tabId, info) {
        if(tab && tab.id == tabId && info.status == 'complete') {
          standardBrowser.tabs.get(tab.id, function(t) {
            cb(t.url);
          });
        }
      });
    } else if(safari) {
      callback['remove-ready'] = function() {
        cb(tab.url);
      }

    }
  }
    
})();
