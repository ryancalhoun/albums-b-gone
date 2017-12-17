if(window.chrome) {
  window.browser = window.chrome;
}
browser.runtime.onMessage.addListener(function(message, sender, sendResponse){
  var key = 'roerunner-cleanit-facebook';
  var data = {};

  var tab;
  var doRemove;

  if(message == 'update-state') {
    try {
      data = JSON.parse(localStorage.getItem(key));
    } catch(e) {}

    if(data && data.running) {
      removeNext();
    }
  }

  function removeNext() {
    if(!data || !data.running)
      return;

    if(data.list.length == 0) {
      data.running = false;
      browser.runtime.sendMessage('update-display');
      return;
    }


    var id = data.list[0];
    doRemove = true;
    if(tab) {
      browser.tabs.update(tab.id, {url: 'https://facebook.com/' + id});
    } else {
      browser.tabs.query({active: true, lastFocusedWindow: true}, function(array_of_Tabs) {
        var active = array_of_Tabs[0];
        browser.tabs.create({url: 'https://facebook.com/' + id, index: active.index}, function(t) {
          tab = t;
        });
      });
    }
  }

  function onRemoveComplete() {
    data.list.shift();
    data.running = data.list.length > 0;

    localStorage.setItem(key, JSON.stringify(data));
    browser.runtime.sendMessage('update-display');

    if(data.running) {
      removeNext();
    } else {
      browser.tabs.remove(tab.id);
      browser.runtime.sendMessage('update-display');
    }
  }

  var waitingForSuccess;
  browser.tabs.onUpdated.addListener(function(tabId, info) {
    if(doRemove && data.running && tab && tab.id == tabId && info.status == 'complete') {
      browser.tabs.get(tab.id, function(t) {
        if(t.url.indexOf(data.list[0] + "") > -1) {
          browser.tabs.sendMessage(tab.id, 'remove', function(s) {
            if(s == 'ok') {
              waitingForSuccess = true;
            }
            if(s == 'not-found') {
              onRemoveComplete();
            }
          });
          doRemove = false;
        }
      });
    } else if(tab && tab.id == tabId){
      browser.tabs.get(tab.id, function(t) {
        if(waitingForSuccess && t.url.indexOf('/groups/') > -1) {
          waitingForSuccess = false;
          setTimeout(onRemoveComplete, 500);
        }
      });
    }
  });
  
});
