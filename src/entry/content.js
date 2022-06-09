// 载入Utils
import Utils from '../assets/js/utils';

Utils.consoleLog('hello world content todo something~');

// console.log(document.querySelectorAll('.hide-article-box.hide-article-pos.text-center'));

// 获取订阅列表
chrome.storage.sync.get('killMoreSubscriptionList', (res) => {
    let rules = [];

    if (res.killMoreSubscriptionList){
        let subscription = JSON.parse(res.killMoreSubscriptionList||[]);
        subscription.forEach(item => {
            Utils.consoleLog(item);
            rules = rules.concat(item.rules);
        })
    }

    process(rules);

    // 使用MutationObserver监听页面 每次dom发生改变都要执行process
    // const observer = new MutationObserver(mutations => {
    //     process(rules);
    // });
    // observer.observe(document.body, {
    //     childList: true,
    //     subtree: true
    // });
})



function process(rules) {
    const url = window.location.href;
    // Check if the array is empty
    if (rules.length === 0) {
        return;
    }

    // find matching rules
    const rule = rules.find(rule => {
        return (new RegExp(rule.url, 'i')).test(url);
    });

    if (rule && (new RegExp(rule.url, 'i')).test(url)) {
        Utils.consoleLog(`website(${url}) kill more.`);
        Utils.consoleLog(document);
        Object.keys(rule.rules).forEach(item => {
            Utils.consoleLog(item);
            Utils.consoleLog(item.selector);
            document.querySelectorAll(item).forEach(element => {
                Utils.consoleLog(element);
                const styleArray = rule.rules[item].split('|');
                // TODO 可以优化
                styleArray.forEach(style => {
                    const styleArray = style.split(':');
                    element.style[styleArray[0]] = styleArray[1];
                });
            });
        });
        statistics(url);
    }
}


function isToday(date) {
    const today = new Date().toLocaleDateString();
    return date === today;
}
// 统计
function statistics(url) {
    chrome.storage.sync.get('killMoreStatistical', (res) => {
        if (!res.killMoreStatistical) {
            chrome.storage.sync.set({killMoreStatistical: JSON.stringify({
                today: new Date().toLocaleDateString(),
                todayNumber: 1,
                killMoreStatistical: 1,
                // 站点列表
                killMoreStatisticalMap: {
                    [url.split('/')[2]]: 1
                }
            })});
        } else {
            const killMoreStatistical = JSON.parse(res.killMoreStatistical);
            const newKillMoreStatistical = JSON.stringify({
                today: new Date().toLocaleDateString(),
                todayNumber: isToday(killMoreStatistical.today) ? killMoreStatistical.todayNumber + 1 : 1,
                killMoreStatistical: killMoreStatistical.killMoreStatistical + 1,
                // 站点列表
                killMoreStatisticalMap: {
                    [url.split('/')[2]]: (killMoreStatistical.killMoreStatisticalMap[url.split('/')[2]]||0) + 1
                }
            })
            Utils.consoleLog(newKillMoreStatistical);
            chrome.storage.sync.set({killMoreStatistical: newKillMoreStatistical});
        }
    })
}