// 载入Utils
import Utils from '../assets/js/utils';

Utils.consoleLog('hello world content todo something~');

// console.log(document.querySelectorAll('.hide-article-box.hide-article-pos.text-center'));

let rules = [
    {
        url: '^.*//blog.csdn.net/.*/article/details/[0-9]*.*$',
        rules: [
            {
                selector: '.hide-article-box.hide-article-pos.text-center',
                callback: function (selector) {
                    selector.forEach(item => {
                        item.style.display = 'none';
                    }
                    );
                }
            },
            {
                selector: '#article_content.article_content.clearfix',
                callback: function (selector) {
                    selector.forEach(item => {
                        item.style.height = 'auto';
                    }
                    );
                }
            }
        ]
    }
]



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
        rule.rules.forEach(item => {
            item.callback(document.querySelectorAll(item.selector));
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
                    [url.split('/')[2]]: killMoreStatistical.killMoreStatisticalMap[url.split('/')[2]] + 1
                }
            })
            Utils.consoleLog(newKillMoreStatistical);
            chrome.storage.sync.set({killMoreStatistical: newKillMoreStatistical});
        }
    })
}

process(rules);