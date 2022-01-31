chrome.action.onClicked.addListener(function() {
    chrome.tabs.create({url: 'public/main/index.html'});
  });

chrome.runtime.onMessage.addListener(async function(message) {
  const sheetsUrl = await fetch(`https://devrel-utm-generator-server.herokuapp.com/apps_script`)
  .then((res) => res.json())
  
  let init = {
    method: 'POST',
    body: JSON.stringify(message),
    headers: {
        "Content-Type": 'application/json',
    },
    'contentType': 'json'
};
  fetch(sheetsUrl, init)
});