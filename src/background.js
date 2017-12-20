(function() {
  var key = 'roerunner-cleanit-facebook';

  var browser = window.browser || window.chrome;
  var safari = window.safari;

  window.updateDisplay = updateDisplay;

  if(browser) {
    browser.runtime.onMessage.addListener(function(message, sender, sendResponse){
      if(message == 'update-state') {
        updateState();
      }
    });
  }

  function updateState() {

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
          attachListener(tab, function(url) {
            if(doRemove && data.running && tab) {
              if(url.indexOf(data.list[0] + "") > -1) {
                signalTab(tab, function(s) {
                  if(s == 'ok') {
                    waitingForSuccess = true;
                  }
                  if(s == 'not-found') {
                    onRemoveComplete();
                  }
                });
                doRemove = false;
              }
            } else {
              if(waitingForSuccess && url.indexOf('/groups/') > -1) {
                waitingForSuccess = false;
                setTimeout(onRemoveComplete, 500);
              }
            }
          });
        }
        tab = t;
      });
    }

    function onRemoveComplete() {
      data.list.shift();
      data.running = data.list.length > 0;

      localStorage.setItem(key, JSON.stringify(data));
      signalDisplay();

      if(data.running) {
        removeNext();
      } else {
        browser.tabs.remove(tab.id);
        signalDisplay();
      }
    }
  }

  function signalDisplay() {
    if(browser.runtime) {
      browser.runtime.sendMessage('update-display');
    } else if(safari) {
      safari.extensions.popovers[0].contentWindow.updateDisplay();
    }
  }

  function openTab(tab, id, cb) {
    var url = 'https://facebook.com/' + id;

    if(browser) {
      if(tab) {
        browser.tabs.update(tab.id, {url: url});
      } else {
        browser.tabs.query({active: true, lastFocusedWindow: true}, function(array_of_Tabs) {
          var active = array_of_Tabs[0];
          browser.tabs.create({url: url, index: active.index}, function(t) {
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
    if(browser) {
      browser.tabs.sendMessage(tab.id, 'remove', cb);
    } else if(safari) {
      function onResponse(event) {
        if(event.name == 'remove-status') {
          cb(event.message);
        }
      }

      safari.application.removeEventListener('message', onResponse);
      safari.application.addEventListener('message', onResponse);

      tab.page.dispatchMessage('remove');
    }
  }

  function attachListener(tab, cb) {
    var waitingForSuccess;

    if(browser) {
      browser.tabs.onUpdated.addListener(function(tabId, info) {
        if(tab && tab.id == tabId && info.status == 'complete') {
          browser.tabs.get(tab.id, function(t) {
            cb(t.url);
          });
        }
      });
    } else if(safari) {
      tab.addEventListener('navigation', function() {
        cb(tab.url);
      });
    }
  }
    
})();
