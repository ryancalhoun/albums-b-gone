var standardBrowser = window.browser || window.chrome;
if(!standardBrowser && typeof browser == 'object')
  standardBrowser = browser;
var safari = window.safari;

if(standardBrowser) {
  standardBrowser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request == 'remove') {
      removeAlbum(sendResponse);
      return true;
    }
  });
} else if(safari) {
  safari.self.addEventListener('message', function(event) {
    if(event.name == 'remove') {
      removeAlbum(function(response) {
        safari.self.tab.dispatchMessage('remove-status', response);
      });
    }
  });
  safari.self.tab.dispatchMessage('remove-ready');
}

function removeAlbum(cb) {
  if(document.querySelector('.uiInterstitial')) {
    cb('not-found');
    return;
  }
  if(document.querySelector('#edit_album_header')) {
    removeAlbumClassic(cb);
  } else if(document.querySelector('[aria-label="Album Edit Composer"]')) {
    removeAlbumNew(cb); 
  } else {
    cb('not-found');
  }
}

function removeAlbumNew(cb) {
  var deleteButton = document.querySelector('[aria-label="Delete Album"]');

  if(deleteButton) {
    setTimeout(function() {
      deleteButton.click();
      setTimeout(confirmDelete, 1000 + Math.random() * 2000);
    }, 1000 + Math.random() * 2000);
  }

  function confirmDelete() {
    var confirmButton = document.querySelector('[role="dialog"] [aria-label="Delete Album"]');
    if(confirmButton) {
      cb('ok');
      confirmButton.click();
    } else {
      setTimeout(confirmDelete, 500);
    }
  }
}


function removeAlbumClassic(cb) {
  var deleteButton;
  try {
    deleteButton = document.querySelector('a[data-tooltip-content="delete album" i]');
  } catch(e) {
    console.log(e);
    deleteButton = document.querySelector('a[data-tooltip-content="Delete Album"]');
    if(!deleteButton) {
      deleteButton = document.querySelector('a[data-tooltip-content="Delete album"]');
    }
  }
  if(deleteButton) {
    setTimeout(function() {
      deleteButton.click();
      setTimeout(confirmDelete, 1000 + Math.random() * 2000);
    }, 1000 + Math.random() * 2000);
  }

  function confirmDelete() {
    var confirmButton = document.querySelector('form button[name=confirmed]');
    if(confirmButton) {
      cb('ok');
      confirmButton.click();
    } else {
      setTimeout(confirmDelete, 500);
    }
  }

}
