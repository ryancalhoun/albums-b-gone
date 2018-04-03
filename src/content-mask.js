if(location.search.indexOf('mask=') > -1) {
  var s = document.createElement('style');
  s.innerHTML = '#edit_album_header > form > div:first-of-type > :not(:first-child), form > .inputs, .fbPhotoBulkEditor .editablePhoto:not(:first-of-type), textarea { display: none; }';
  document.documentElement.appendChild(s);
}
