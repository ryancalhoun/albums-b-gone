if(!window.browser && window.chrome) {
  window.browser = window.chrome;
}
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  if(request != 'remove') {
    return;
  }

  if(document.querySelector('.uiInterstitial')) {
    sendResponse('not-found');
    return;
  }
  if(!document.querySelector('.fbPhotoAlbumHeader')) {
    sendResponse('not-found');
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
      sendResponse('ok');
      confirmButton.click();
    } else {
      setTimeout(confirmDelete, 500);
    }
  }

  return true;
});


