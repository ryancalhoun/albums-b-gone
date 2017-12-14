(function() {
  var key = 'roerunner-cleanit-facebook';
  var data = {};

  setTimeout(updateDisplay);
  setTimeout(wireListeners);

  function updateDisplay() {
    try {
      data = JSON.parse(localStorage.getItem(key));
    } catch(e) {}

    if(data && data.list.length > 0) {
      var list = '';
      for(var i = 0; i < data.list.length; ++i) {
        list += data.list[i] + '\n';
      }
      
      document.querySelector('textarea').value = list;

      if(data.running) {
        document.querySelector('textarea').setAttribute('readonly', '');
        document.querySelector('button[name=play]').setAttribute('disabled', '');
        document.querySelector('button[name=pause]').removeAttribute('disabled');
      } else {
        document.querySelector('textarea').removeAttribute('readonly');
        document.querySelector('textarea').focus();
        document.querySelector('button[name=play]').removeAttribute('disabled');
        document.querySelector('button[name=pause]').setAttribute('disabled', '');
      }
    } else {
      document.querySelector('textarea').removeAttribute('readonly');
      document.querySelector('textarea').focus();
      document.querySelector('button[name=play]').setAttribute('disabled', '');
      document.querySelector('button[name=pause]').setAttribute('disabled', '');
    }
  }

  function wireListeners() {
    document.querySelector('textarea').addEventListener('keyup', onInput);
    document.querySelector('textarea').addEventListener('paste', onInput);

    document.querySelector('button[name=play]').addEventListener('click', function() {
      updateState({running: true});
    });
    document.querySelector('button[name=pause]').addEventListener('click', function() {
      updateState({running: false});
    });
  }

  function onInput() {
    if(data && data.running) {
      return;
    }
    if(this.value && this.value.match(/^(\d+\s*)+$/)) {
      document.querySelector('button[name=play]').removeAttribute('disabled');
    } else {
      document.querySelector('button[name=play]').setAttribute('disabled', '');
    }
  }

  function updateState(state) {
    localStorage.setItem(key, JSON.stringify({
      running: state.running,
      list: document.querySelector('textarea').value.trim().split(/\s+/)
    }));

    chrome.runtime.sendMessage('update-state');
    setTimeout(updateDisplay);
  }

  chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if(message == 'update-display') {
      setTimeout(updateDisplay);
    }
  });
})();
