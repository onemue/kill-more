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

          <el-form-item label="过滤路径">
            <el-input v-model="generallyForm.rulePath"></el-input>
          </el-form-item>

          <el-form-item label="过滤表名">
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
        <el-table-column label="" width="200">
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
        advanced
      </div>
      <div class="tabs-container about" v-if="tabActiveName === 'about'">
        about
      </div>
    </header>
  </div>
</template>

<script>
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
    };
  },
  mounted() {
    this.getGenerally();
    this.getWhitelist();
  },
  methods: {
    getGenerally() {
      chrome.storage.sync.get('generallySetup', (res)=>{
        console.log(res);
        this.generallyForm = JSON.parse(res.generallySetup);
      });
    },
    saveGenerally() {
      console.log(this.generallyForm);
      chrome.storage.sync.set({'generallySetup': JSON.stringify(this.generallyForm)});
    },
    getWhitelist() {
      let _this = this;
      chrome.storage.sync.get("killMoreWhitelist", (res) => {

        let whitelist = JSON.parse(res.killMoreWhitelist||'[]');
        console.log(whitelist)
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
      });
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
