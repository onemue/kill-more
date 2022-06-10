<template>
  <div class="main_app">
    <header>
      <h1>Kill More</h1>
      <el-tabs v-model="tabActiveName" value="generally">
        <el-tab-pane
          :label="item.label"
          :name="item.name"
          v-for="item in tabs"
          :key="item.name"
        ></el-tab-pane>
      </el-tabs>
      <div class="tabs-container generally" v-if="tabActiveName === 'generally'">
        <el-form ref="form" :model="generallyForm" label-width="200px">
          <el-form-item label="Debug">
            <el-switch v-model="generallyForm.Debug"></el-switch>
          </el-form-item>

          <!-- <el-form-item label="过滤路径">
            <el-input v-model="generallyForm.rulePath"></el-input>
          </el-form-item> -->

          <el-form-item label="">
            <el-button type="primary" @click="saveGenerally">保存</el-button>
            <el-button>取消</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="tabs-container whitelist" v-if="tabActiveName === 'whitelist'">
        <el-table
        :data="whitelistMap"
        style="width: 100%">
        <el-table-column
          prop="value"
          label="白名单">
        </el-table-column>
        <el-table-column label="" width="80">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="deleteWhitelist(scope.row.value)">删除</el-button>
        </template>
      </el-table-column>
      </el-table>
      </div>
      <div class="tabs-container advanced" v-if="tabActiveName === 'advanced'">
      <el-table
        :data="subscription"
        style="width: 100%">
        <el-table-column
          prop="isEnable"
          label="状态"
          width="100">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.isEnable"
              @change="changeSubscription(scope.row.subscriptionUrl)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="名称"
          >
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="点击更新" placement="top-start">
              <el-link type="primary" @click="updateSubscription(scope.row.subscriptionUrl)">{{ scope.row.name  }}</el-link>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          prop="latestUpdateTime"
          label="最近更新时间">
          <template slot-scope="scope">
            {{ new Date(scope.row.latestUpdateTime ) }}
          </template>
        </el-table-column>
        <el-table-column label="" width="80">
        <template slot="header">
          <el-button
            size="mini"
            type="primary"
            @click="add">新增</el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="deleteSubscription(scope.row.subscriptionUrl)">删除</el-button>
        </template>
      </el-table-column>
      </el-table>

      <el-dialog title="新增订阅" :visible.sync="dialogFormVisible">
        <el-form :model="addSubscriptionForm">
          <el-form-item label="订阅地址">
            <el-input v-model="addSubscriptionForm.url" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addSubscription">确 定</el-button>
        </div>
      </el-dialog>

      </div>
      <div class="tabs-container about" v-if="tabActiveName === 'about'">
        about
      </div>
    </header>
  </div>
</template>

<script>
import yaml from 'js-yaml';
import Utils from '../assets/js/utils';


export default {
  name: "optionsView",
  data() {
    return {
      tabs: [
        {
          name: "generally",
          label: "一般",
        },
        {
          name: "whitelist",
          label: "白名单",
        },
        {
          name: "advanced",
          label: "高级",
        },
        {
          name: "about",
          label: "关于",
        },
      ],
      tabActiveName: "generally",
      generallyForm: {
        Debug: false,
        rulePath: "",
      },
      whitelist: [],
      subscription: [],
      addSubscriptionForm: {},
      dialogFormVisible: false
    };
  },
  mounted() {
    this.getGenerally();
    this.getWhitelist();
    this.getSubscriptionList();
  },
  methods: {
    getGenerally() {
      chrome.storage.sync.get('generallySetup', (res)=>{
        Utils.consoleLog(res);
        this.generallyForm = JSON.parse(res.generallySetup||'[]');
      });
    },
    saveGenerally() {
      Utils.consoleLog(this.generallyForm);
      chrome.storage.sync.set({'generallySetup': JSON.stringify(this.generallyForm)},()=>        this.$message({
          message: '保存成功',
          type: 'success'
        }));

    },
    getWhitelist() {
      let _this = this;
      chrome.storage.sync.get("killMoreWhitelist", (res) => {

        let whitelist = JSON.parse(res.killMoreWhitelist||'[]');
        Utils.consoleLog(whitelist)
        _this.whitelist = whitelist;
      });
    },
    deleteWhitelist(rule){
      let _this = this;
      chrome.storage.sync.get("killMoreWhitelist", (res) => {
        let whitelist = JSON.parse(res.killMoreWhitelist||'[]');
        let newWhitelist = whitelist.filter(item => item !== rule);
        chrome.storage.sync.set({'killMoreWhitelist': JSON.stringify(newWhitelist)});
        _this.whitelist = newWhitelist;
        this.$message({
          message: '删除成功',
          type: 'success'
        });
      });
    },
    // 获取订阅列表
    getSubscriptionList() {
      let _this = this;
      chrome.storage.sync.get('killMoreSubscriptionList', (res) => {
        _this.subscription = JSON.parse(res.killMoreSubscriptionList||[]);
      })
    },
    add() {
      this.dialogFormVisible = true;
    },
    addSubscription() {
      let _this = this;
      _this.dialogFormVisible = false;
      fetch(_this.addSubscriptionForm.url)
      .then(response => response.text().then(
        (text)=>{
          // https://pan-onemue.oss-cn-beijing.aliyuncs.com/pan_onemue_cn%2Fuser%2F1%2FBIj96ezr_demo.yml
          Utils.consoleLog(text);
          let rules = yaml.load(text);

          Utils.consoleLog(rules);
          rules.latestUpdateTime = new Date().getTime();
          rules.isEnable = false;
          rules.subscriptionUrl = _this.addSubscriptionForm.url;

          chrome.storage.sync.get('killMoreSubscriptionList', (res) => {
            let subscription = JSON.parse(res.killMoreSubscriptionList||'[]');
            subscription.push(rules);
            chrome.storage.sync.set({'killMoreSubscriptionList': JSON.stringify(subscription)});
            _this.subscription = subscription;
          })
        }
      ))
    },
    updateSubscription(url){
      let _this = this;
      fetch(url)
      .then(response => response.text().then(
        (text)=>{
          Utils.consoleLog(text);
          let rules = yaml.load(text);

          Utils.consoleLog(rules);
          rules.latestUpdateTime = new Date().getTime();
          rules.isEnable = false;
          rules.subscriptionUrl = url;

          chrome.storage.sync.get('killMoreSubscriptionList', (res) => {
            let subscription = JSON.parse(res.killMoreSubscriptionList||'[]');
            subscription = subscription.filter(item => item.subscriptionUrl !== url);
            subscription.push(rules);
            chrome.storage.sync.set({'killMoreSubscriptionList': JSON.stringify(subscription)});
            _this.subscription = subscription;
            _this.$message({
              message: '更新成功',
              type: 'success'
            });
          })
        }
      ))
    },
    deleteSubscription(url){
      let _this = this;
      chrome.storage.sync.get('killMoreSubscriptionList', (res) => {
            let subscription = JSON.parse(res.killMoreSubscriptionList||'[]');
            subscription = subscription.filter(item => item.subscriptionUrl !== url);
            chrome.storage.sync.set({'killMoreSubscriptionList': JSON.stringify(subscription)});
            _this.subscription = subscription;
            _this.$message({
              message: '删除成功',
              type: 'success'
            });
      })
    },
    changeSubscription(url){
      let _this = this;
      chrome.storage.sync.get('killMoreSubscriptionList', (res) => {
        let subscription = JSON.parse(res.killMoreSubscriptionList||'[]');
        subscription.forEach(item => {
          if(item.subscriptionUrl === url){
            item.isEnable = item.isEnable?false:true;
          }
        });
        chrome.storage.sync.set({'killMoreSubscriptionList': JSON.stringify(subscription)});
        _this.subscription = subscription;
      })
    }
  },
  computed: {
    whitelistMap() {
      return this.whitelist.map((item) => {
        return {
          label: item,
          value: item,
        };
      });
    },
  },
};
</script>

<style>
@import url(../assets/css/reset.css);
@import url(../assets/css/common.css);

.main_app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 1000px;
  margin: 0 auto;
}

header h1 {
  font-size: 2em;
  line-height: 2.5em;
  margin: 0;
  padding: 0;
  color: #2c3e50;
}
</style>
