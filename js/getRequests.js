const requests = {};

function addRequest(tabId, details) {
  if (!requests[tabId]) {
    requests[tabId] = [];
  }
  requests[tabId].push(details);
}

function getRequests(tabId) {
  return requests[tabId] || [];
}

function clearRequests(tabId) {
  delete requests[tabId];
}

browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    var tabId = details.tabId.toString();
    addRequest(tabId, details);
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

browser.tabs.onRemoved.addListener(function (tabId) {
  clearRequests(tabId);
});
