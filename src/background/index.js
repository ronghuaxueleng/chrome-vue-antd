/*global chrome  全局*/
// 在扩展程序启动时添加初始规则
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.getDynamicRules(function (res) {
    let rules = res.map((e) => e.id);
    chrome.declarativeNetRequest.updateDynamicRules(
        {
          addRules: [], //Rule[] optional
          removeRuleIds: rules, //number[] optional
        },
        function (callback) {}
    );
  });
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var currentTab = request.tabs[0];
  if (request.action === "injectCookie") {
    // 删除所有cookie
    clearAllCookie(currentTab)
    // 注入cookie
    injectData(request.data, currentTab);
  } else if (request.action === "delCookie") {
    // 获取指定 URL 下的所有 cookie
    chrome.cookies.getAll({ url: currentTab.url }, (cookies) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        // 删除每个 cookie
        let count = 0;
        cookies.forEach((cookie) => {
          chrome.cookies.remove(
            { url: currentTab.url, name: cookie.name },
            (removedCookie) => {
              count++;
              checkAndReload(count, cookies.length, currentTab);
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
              } else {
                console.log("Cookie removed:", removedCookie);
              }
            }
          );
        });
      }
    });
  } else if (request.action === "copyAllCookie") {
    // 获取指定 URL 下的所有 cookie
    chrome.cookies.getAll({ url: currentTab.url }, (cookies) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        const cookieList = cookies.map((item) => {
          return {
            name: item.name,
            value: item.value,
          };
        });
        chrome.storage.sync.get(["cookie"], async (data) => {
          const foundItem = data.cookie.find(
            (item) => item.name === request.name
          );
          foundItem.cookiesArr = cookieList;
          chrome.storage.sync.set(data, () => {
            sendResponse({ message: "处理成功！" });
          });
        });
      }
    });
  }
  sendResponse({ message: "处理成功！" });
  return true;
});

// 异步函数，用于获取已使用的 Cookie
async function getUsedCookie() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("usedCookie", (result) => {
      resolve(result);
    });
  });
}

const checkAndReload = (currentCount, totalCount, currentTab) => {
  // 检查是否所有操作完成，如果是，刷新当前标签页
  if (currentCount === totalCount) {
    chrome.tabs.reload(currentTab.id);
  }
};

const injectData = (data, currentTab) => {
  // 注入 cookie
  const newData = data.map((item) => ({
    ...item,
    url: currentTab.url,
    path: "/",
  }));
  let count = 0;
  newData.forEach((item) => {
    if (item.type === 1 || item.type === undefined) {
      // 注入 cookie
      delete item['hostOnly']
      delete item['session']
      item['url'] = currentTab.url
      chrome.cookies.set(item, (result) => {
        console.log("Cookie is set:", result);
        count++;
        checkAndReload(count, newData.length, currentTab);
      });
    } else if (item.type === 2) {
      count++;
      checkAndReload(count, newData.length, currentTab);
    }
  });
};

const clearAllCookie = (currentTab) => {
  chrome.cookies.getAll({ url: currentTab.url }, (cookies) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      // 删除每个 cookie
      let count = 0;
      cookies.forEach((cookie) => {
        chrome.cookies.remove(
            { url: currentTab.url, name: cookie.name },
            (removedCookie) => {
              count++;
              checkAndReload(count, cookies.length, currentTab);
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
              } else {
                console.log("Cookie removed:", removedCookie);
              }
            }
        );
      });
    }
  });
}
