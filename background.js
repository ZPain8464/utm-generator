chrome.action.onClicked.addListener(function() {
    chrome.tabs.create({url: 'public/main/index.html'});
  });