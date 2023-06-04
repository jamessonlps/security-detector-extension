async function getCookiesForTab(tabs) {
  let tab = tabs.pop();

  let currentTab = document.getElementById('cookies-list');
  let gettingAllCookies = browser.cookies.getAll({});
  let cookiesScore;
  let firstPartCookies = 0;
  let sessionCookies = 0;
  let secureNumberOfCookies = 0;
  let cookiesAmount = 0;

  await gettingAllCookies.then((cookies) => {
    cookiesAmount = cookies.length;

    if (cookiesAmount > 0) {
      for (let cookie of cookies) {
        if (cookie.secure) {
          secureNumberOfCookies += 1;
        }
        if (cookie.session) {
          sessionCookies += 1;
        }
        if (tab.url.includes(cookie.domain)) {
          firstPartCookies += 1;
        }
      }
    }

    cookiesScore = cookies.length > 0 ? secureNumberOfCookies / cookiesAmount : 0.5;
  });

  let textFirstParty = document.createTextNode(`First-party cookies: ${firstPartCookies}`);
  let textThirdParty = document.createTextNode(`Third-party cookies: ${cookiesAmount - firstPartCookies}`);
  let textSession = document.createTextNode(`Session cookies: ${sessionCookies}`);
  let textNavigation = document.createTextNode(`Navigation cookies: ${cookiesAmount - sessionCookies}`);

  currentTab.appendChild(textFirstParty);
  currentTab.appendChild(document.createElement('br'));
  currentTab.appendChild(textThirdParty);
  currentTab.appendChild(document.createElement('br'));
  currentTab.appendChild(textSession);
  currentTab.appendChild(document.createElement('br'));
  currentTab.appendChild(textNavigation);

  return cookiesScore;
}


async function getLocalStorageForTab(storage) {
  let currentTab = document.getElementById('local-storage-info');
  let totalSize = 0;

  if (storage.length > 0) {
    let ulElement = document.createElement('ul');

    for (let i in storage) {
      let item = storage[i];
      // item.length is the size of the string in bytes
      // i.length is the size of the key in bytes
      // sum both and multiply by 2 to get the size in bytes
      totalSize += (item.length + i.length) * 2;

      let json = JSON.parse(item);
      let li = document.createElement('li');
      let text = document.createTextNode(`${i + 1}: ${Object.keys(json)[0]}`);
      li.appendChild(text);
      ulElement.appendChild(li);
    }

    let text = document.createTextNode(`Há ${storage.length} iten(s) no Local Storage (${(totalSize / 1024.0).toFixed(2)} KB)`);
    currentTab.appendChild(text);

    currentTab.appendChild(ulElement);
  }

  else {
    let text = document.createTextNode(`Local Storage vazio neste site.`);
    currentTab.appendChild(text);
  }

  return storage.length > 0 ? 1.0 - (totalSize / 1024.0) / 5120.0 : 0.5;
}


async function getThirdPartyConnectionsForTab() {
  let requests = browser
    .extension
    .getBackgroundPage()
    .getRequests();

  let currentTab = document.getElementById('third-party-info');
  let thirdPartyRequests = 0;
  let requestsAmount = requests.length;

  if (requestsAmount > 0) {
    let uiElement = document.createElement('ul');

    for (let i in requests) {
      let request = requests[i];
      thirdPartyRequests += (request.thirdParty === true);

      if (request.thirdParty === true) {
        let li = document.createElement('li');
        let text = document.createTextNode(`${request.url}`);
        li.appendChild(text);
        uiElement.appendChild(li);
      }
    }

    let textRequestsAmount = document.createTextNode(`${thirdPartyRequests} conexões de terceiros detectadas`);
    currentTab.appendChild(textRequestsAmount);

    currentTab.appendChild(uiElement);
  }

  return requestsAmount > 0 ? 1.0 - thirdPartyRequests / requestsAmount : 0.5;
}


function calculateGlobalScore(cookiesScore, storageScore, connectionScore) {
  let currentTab = document.getElementById('average-score');
  let averageScore = Math.pow(cookiesScore * cookiesScore * storageScore * storageScore * connectionScore, 1 / 5);

  if (averageScore <= 0.2) {
    currentTab.style.color = 'red';
  }
  else if (averageScore <= 0.4) {
    currentTab.style.color = 'orange';
  }
  else if (averageScore <= 0.6) {
    currentTab.style.color = 'yellow';
  }
  else if (averageScore <= 0.8) {
    currentTab.style.color = 'green';
  }
  else {
    currentTab.style.color = 'blue';
  }

  let text = document.createTextNode(`Pontuação: ${averageScore.toFixed(2)}`);
  currentTab.appendChild(text);
}

async function getHttpsForTab(tabs) {
  let tab = tabs.pop();
  let hasHttps;

  let currentTab = document.getElementById("https-info");

  if (tab.url.includes("https://")) {
    hasHttps = true;
  }
  else {
    hasHttps = false;
  }

  if (hasHttps) {
    let text = document.createTextNode("HTTPS detectado!");
    currentTab.style.color = 'green';
    currentTab.appendChild(text);
  }
  else {
    let text = document.createTextNode("HTTPS não detectado!");
    currentTab.style.color = 'red';
    currentTab.appendChild(text);
  }

  return hasHttps ? 1.0 : 0.0;
}


async function getCurrentTab() {
  return browser.tabs.query({ currentWindow: true, active: true });
}

async function execute() {
  let hasHttps = await getHttpsForTab(await getCurrentTab());
  let cookiesScore = await getCookiesForTab(await getCurrentTab());
  let storage = await browser.tabs.executeScript({ file: "js/getLocalStorage.js" });
  let storageScore = await getLocalStorageForTab(storage[0]);
  let connectionScore = await getThirdPartyConnectionsForTab();

  calculateGlobalScore(cookiesScore, storageScore, connectionScore);
}

execute();
