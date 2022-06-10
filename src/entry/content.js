// 载入Utils
import Utils from '../assets/js/utils';

Utils.consoleLog('hello world content todo something~');

// Utils.consoleLog(document.querySelectorAll('.hide-article-box.hide-article-pos.text-center'));

// 获取订阅列表
chrome.storage.sync.get(['killMoreSubscriptionList', 'killMoreWhitelist'], (res) => {
    const url = window.location.href;
    let rules = [];

    if (res.killMoreSubscriptionList){
        let subscription = JSON.parse(res.killMoreSubscriptionList||'[]');
        let whitelist = JSON.parse(res.killMoreWhitelist||'[]');
        Utils.consoleLog(whitelist.findIndex(item => {
            return (new RegExp(item, 'i')).test(url);
        }));
        if (whitelist.findIndex((item =>new RegExp(item, 'i').test(url))) !== -1) {
            Utils.consoleLog('whitelist');
            return false;
        }

        subscription.forEach(item => {
            Utils.consoleLog(item);
            if(item.isEnable){
                rules = rules.concat(item.rules);
            }
        })
        Utils.consoleLog(rules);
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
            document.querySelectorAll(item).forEach(element => {
                Utils.consoleLog(element);
                Utils.consoleLog(rule.rules[item]);

                const styleArray = rule.rules[item].split('|');
                // TODO 可以优化
                styleArray.forEach(style => {
                    // 如果 style 第一位为~ 则表示移除 ~. 移除class ~# 移除id ~ 表示移除元素
                    if (style.startsWith('~')) {
                        if (style.startsWith('~.')) {
                            element.classList.remove(style.substring(2));
                            return;
                        } else if (style.startsWith('~#')) {
                            element.id = '';
                            return;
                        } else {
                            element.remove();
                            return;
                        }
                    }
                    // 如果 style 第一位为. 则表示添加class # 添加id
                    else if (style.startsWith('.')) {
                        element.classList.add(style.substring(1));

                    }
                    else if (style.startsWith('#')) {
                        element.id = style.substring(1);
                    }
                    // 如果第一位为 $ 则表示执行()内js 参数为element
                    else if ((/^\$\(.+?\)$/g).test(style)) {
                        // 获取$()内的内容
                        const js = style.substring(1, style.length - 1);
                        try {
                            new Function('element', js)(element);
                        } catch (error) {
                            Utils.consoleLog(js);
                        }
                    }
                    const styleArray = style.split(':');
                    Utils.consoleLog(styleArray);
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