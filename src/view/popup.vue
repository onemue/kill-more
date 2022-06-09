<template>
  <div class="main_app">
    <header>
      <div class="title">
        <img class="logo" src="../assets/logo.png" alt="logo" />
        <h1>Kill More</h1>
      </div>
      <!-- <div class="header-title">消灭更多</div> -->
      <div class="popup-setup" v-if="isWebsite">
        <div class="title">此网站</div>
        <div class="description" :title="mainUrl">{{ mainUrl }}</div>
        <div class="switch">
          <el-switch v-model="isKillsMain"  @change="setWhitelist(`^.*[${escapeRegExp(mainUrl)}].*$`, 'main')"> </el-switch>
        </div>
      </div>
      <div class="popup-setup" v-if="isWebsite">
        <div class="title">此页面</div>
        <!-- 相对地址 -->
        <div class="description" :title="`/${relativeUrl}`">
          /{{ relativeUrl }}
        </div>
        <div class="switch">
          <el-switch v-model="isKillsRelative" @change="setWhitelist(`^.*(${escapeRegExp(mainUrl)}/${escapeRegExp(relativeUrl)}).*$`, 'relative')"> </el-switch>
        </div>
      </div>
    </header>
    <main>
      <div class="panel-container">
        <div class="panel-header">kill number</div>
        <div class="panel kill-number">
          <div
            class="kill-number-item"
            v-for="item in killNumberList"
            :key="item.key"
            :id="item.key"
          >
            <div class="kill-number-title">{{ item.title }}</div>
            <div class="kill-number-value">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </main>
    <footer></footer>
  </div>
</template>

<script>
export default {
  name: "popupView",
  data() {
    return {
      msg: "popup",
      url: window.location.href,
      isKillsMain: true,
      isKillsRelative: true,
      statistical: {},
    };
  },
  mounted() {
    let _this = this;

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      console.log(tabs);
      _this.url = tabs[0].url;
      _this.getStatistics();
      _this.getWhitelist();
      // use `url` here inside the callback because it's asynchronous!
    });
    // 获取统计
  },
  methods: {
    // 将字符串中正则转换成\
    escapeRegExp(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    },
    getStatistics() {
      let _this = this;
      chrome.storage.sync.get("killMoreStatistical", (res) => {
        _this.statistical = JSON.parse(res.killMoreStatistical);
        console.log(_this.statistical, res.killMoreStatistical);
        
      });
    },
    getWhitelist() {
      let _this = this;
      chrome.storage.sync.get("killMoreWhitelist", (res) => {

        let whitelist = JSON.parse(res.killMoreWhitelist||'[]');
        console.log(whitelist)
        
        whitelist.forEach(element => {
          console.log(element, `^.*${_this.url}.*$`, `^.*${_this.url}/${_this.relativeUrl}.*$`);
          if(new RegExp(element).test(_this.url)){
            _this.isKillsRelative = false;
          }
          if(new RegExp(element).test(_this.mainUrl)){
            _this.isKillsMain = false;
          }
          
        });
      });
    },
    setWhitelist(rule, type) {
      let _this = this;
      chrome.storage.sync.get("killMoreWhitelist", (res) => {
        console.log(res)
        let whitelist = JSON.parse(res.killMoreWhitelist||'[]');
        if (!_this.isKillsMain && type==="main"||!_this.isKillsRelative && type==="relative") {
          whitelist.push(rule);
        } else {
          whitelist.splice(whitelist.indexOf(rule), 1);
        }

        chrome.storage.sync.set({ killMoreWhitelist: JSON.stringify(whitelist) }, () => {
          console.log("set whitelist success");
        });
      });
    }
  },
  computed: {
    mainUrl() {
      return this.url.split("/")[2];
    },
    relativeUrl() {
      // 返回除去域名外其他内容
      return this.url.split("/").slice(3).join("/");
    },
    isWebsite() {
      // 如果协议不为 http 或 https 则不是网站
      if (
        this.url.split("/")[0] !== "http:" &&
        this.url.split("/")[0] !== "https:"
      ) {
        return false;
      }
      return true;
    },
    killNumberList() {
      let _this = this;
      let killNumberList = [];
      let statistical = _this.statistical;
      let mainUrl = _this.mainUrl;
      let thisSiteKillNumber = statistical?.killMoreStatisticalMap?.[mainUrl] || 0;
      let todayKillNumber = statistical?.todayNumber || 0;
      let killNumber = statistical?.killMoreStatistical || 0;
      thisSiteKillNumber &&
        killNumberList.push({
          key: "thisKillNumber",
          title: "本站",
          value: thisSiteKillNumber,
        });
      todayKillNumber &&
        killNumberList.push({
          key: "todayKillNumber",
          title: "今日",
          value: todayKillNumber,
        });
      killNumber &&
        killNumberList.push({
          key: "killNumber",
          title: "总计",
          value: killNumber,
        });
      return killNumberList;
    },
  },
};
</script>

<style scoped>
@import url(../assets/css/reset.css);
@import url(../assets/css/common.css);

.main_app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  min-width: 340px;
  max-width: 340px;
}

header {
  background: var(--background-color-primary);
  border-bottom-width: var(--border-width-thin);
  border-bottom-style: var(--border-style-primary);
  border-bottom-color: var(--border-color-primary);
  padding: var(--padding-primary);
}
header > .title {
  display: flex;
  line-height: 2.5em;
}
header .logo {
  width: 2.5em;
  height: 2.5em;
  margin-right: 10px;
}
header .header-title {
  margin-top: var(--margin-secondary);
  font-size: var(--font-size-primary);
  font-weight: bold;
}

.popup-setup {
  display: flex;
  line-height: 2em;
}
.popup-setup .description {
  font-size: 0.8em;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  /*文字超出宽度则显示ellipsis省略号*/
  text-overflow: ellipsis;
  margin-right: var(--margin-secondary);
}
.popup-setup .title {
  margin-right: var(--margin-secondary);
}
main {
  color: var(--color-primary);
  padding: var(--padding-primary);
  font-size: var(--font-size-primary);
  background-color: var(--background-color-secondary);
}

.panel {
  width: calc(100% - var(--padding-primary) * 2);
  background-color: var(--background-color-primary);
  box-shadow: var(--ox-shadow-primary);
  padding: var(--padding-primary);
  margin-top: var(--margin-secondary);
  background-color: var(--background-color-primary);

  border-radius: var(--border-radius-primary);
  box-shadow: var(--box-shadow-primary);
}
.kill-number {
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  font-weight: bold;
}
.kill-number-title {
  font-size: var(--font-size-primary);
}
.kill-number-value {
  font-size: 1.4em;
  margin-top: var(--margin-secondary);
  color: var(--color-secondary);
}
</style>
