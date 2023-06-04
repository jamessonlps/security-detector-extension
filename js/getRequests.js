var requests = [];

function addRequest(details) {
  requests.push(details);
}

function getRequests() {
  return requests;
}

browser.webRequest.onBeforeRequest.addListener(
  addRequest,
  { "urls": ["<all_urls>"] }
);
