chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
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
      chrome.runtime.sendMessage('update-display');
      return;
    }


    var id = data.list[0];
    console.log("removeNext", id);
    doRemove = true;
    if(tab) {
      chrome.tabs.update(tab.id, {url: 'https://facebook.com/' + id});
    } else {
      chrome.tabs.create({url: 'https://facebook.com/' + id}, function(t) {
        tab = t;
      });
    }
  }

  function onRemoveComplete() {
    console.log("onRemoveComplete", JSON.stringify(data));

    data.list.shift();
    data.running = data.list.length > 0;
    console.log("onRemoveComplete.2", JSON.stringify(data));

    localStorage.setItem(key, JSON.stringify(data));
    chrome.runtime.sendMessage('update-display');

    if(data.running) {
      removeNext();
    } else {
      chrome.tabs.remove(tab.id);
    }
  }

  var waitingForSuccess;
  chrome.tabs.onUpdated.addListener(function(tabId, info) {
    if(doRemove && data.running && tab && tab.id == tabId && info.status == 'complete') {
      chrome.tabs.get(tab.id, function(t) {
        console.log("Do remove", data.list[0], info);
        if(t.url.indexOf(data.list[0] + "") > -1) {
          console.log("Send message", data.list[0]);
          chrome.tabs.sendMessage(tab.id, 'remove', function(s) {
            console.log(s);
            if(s == 'ok') {
              waitingForSuccess = true;
            }
            if(s == 'not-found') {
              console.log("C1", "not found");
              onRemoveComplete();
            }
          });
          doRemove = false;
        }
      });
    } else if(tab && tab.id == tabId){
      chrome.tabs.get(tab.id, function(t) {
        if(waitingForSuccess && t.url.indexOf('/groups/') > -1) {
          waitingForSuccess = false;
          console.log("C2", t);
          setTimeout(onRemoveComplete, 500);
        }
      });
    }
  });
  
});
