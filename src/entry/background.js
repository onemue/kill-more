console.log('hello world background todo something~')
const yaml = require('js-yaml');

const defaultUrl = 'https://onemue.github.io/kill-more/source/default.yml';

chrome.runtime.onInstalled.addListener(async () => {
    // 订阅列表初始化
    // 设置初始化 V
    // 预设订阅 https://onemue.github.io/kill-more/source/default.yml V
    
    fetch(defaultUrl)
    .then(response => response.text().then(
      (text)=>{
        console.log(text);
        let rules = yaml.load(text);
        let subscription = [];

        console.log(rules);
        rules.latestUpdateTime = new Date().getTime();
        rules.isEnable = false;
        rules.subscriptionUrl = defaultUrl;

        subscription.push(rules);

        chrome.storage.sync.set({
            whitelist: [],
            generallySetup: JSON.stringify({
                Debug: false,
                rulePath: "",
            },),
            killMoreSubscriptionList: JSON.stringify(subscription),
            killMoreStatistical: JSON.stringify({
                    today: '2022/6/9',
                    todayNumber: 0,
                    killMoreStatistical: 0,
                    killMoreStatisticalMap: {}
            })
        }, function() {
            console.log('初始化成功');
        });
      }
    ))
});