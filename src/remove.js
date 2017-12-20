var browser = window.browser || window.chrome;
var safari = window.safari;

if(browser) {
  browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
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
}

function removeAlbum(cb) {
  if(document.querySelector('.uiInterstitial')) {
    cb('not-found');
    return;
  }
  if(!document.querySelector('.fbPhotoAlbumHeader')) {
    cb('not-found');
    return;
  }

  var deleteButton = document.querySelector('a[data-tooltip-content="Delete Album"]');
  if(deleteButton) {
    deleteButton.click();
    setTimeout(confirmDelete, 1000);
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
