export default class Utils {
    // 接管console.log
    static consoleLog(...args) {
        chrome.storage.sync.get('generallySetup', (res)=>{
            const generallyForm = JSON.parse(res.generallySetup);
            if (generallyForm.Debug&&window.console && window.console.log) {
                window.console.log('[KillMore]:',...args);
            }
          });
    }
}