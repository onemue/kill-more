const yaml = require('js-yaml');


const defaultUrl = 'https://onemue.github.io/kill-more/source/default.yml';

chrome.runtime.onInstalled.addListener(async () => {
  // 订阅列表初始化
  // 设置初始化 V
  // 预设订阅 https://onemue.github.io/kill-more/source/default.yml V

  fetch(defaultUrl)
    .then(response => response.text().then(
      (text) => {
        // // Utils.consoleLog(text);
        let rules = yaml.load(text);
        let subscription = [];

        // // Utils.consoleLog(rules);
        rules.latestUpdateTime = new Date().getTime();
        rules.isEnable = true;
        rules.subscriptionUrl = defaultUrl;

        subscription.push(rules);

        chrome.storage.sync.set({
          whitelist: [],
          generallySetup: JSON.stringify({
            Debug: false,
            rulePath: "",
          }),
          killMoreSubscriptionList: JSON.stringify(subscription),
          killMoreStatistical: JSON.stringify({
            today: '2022/6/9',
            todayNumber: 0,
            killMoreStatistical: 0,
            killMoreStatisticalMap: {}
          })
        }, function () {
          // Utils.consoleLog('初始化成功');
        });
      }
    ))
});


// 更新订阅列表
chrome.storage.sync.get('killMoreSubscriptionList', (res) => {
  let subscription = JSON.parse(res.killMoreSubscriptionList || '[]');
  let newSubscription = [];
  subscription.forEach(element => {
    fetch(element.subscriptionUrl)
      .then(response => response.text().then(
        (text) => {
          // Utils.consoleLog(text);
          let rules = yaml.load(text);
          rules.latestUpdateTime = new Date().getTime();
          rules.isEnable = element.isEnable;
          rules.subscriptionUrl = element.subscriptionUrl;
          newSubscription.push(rules);
        }))
        .catch(err => {
          newSubscription.push(element);
          console.log(err);
        });
    });

  chrome.storage.sync.set({
    killMoreSubscriptionList: JSON.stringify(subscription),
  }, function () {
    // Utils.consoleLog('更新订阅列表成功');
  }
  );
});