<template>
  <div class="main">
      <a-space-compact>
          <a-button type="link" href="https://www.liblib.art/message" target="_blank">跳转到lib</a-button>
      </a-space-compact>
      <a-space-compact>
          <a-form  layout="inline" name="syncData" :model="searchFrom" @finish="syncData">
              <a-form-item label="searchValue" name="searchValue">
                  <a-input v-model:value="searchFrom.searchValue"/>
              </a-form-item>
              <a-form-item style="text-align: center;">
                  <a-button type="primary" html-type="submit">同步数据</a-button>
              </a-form-item>
          </a-form>
      </a-space-compact>
    <a-table :columns="columns" :data-source="data" :scroll="{ x: '100%' }" size='small'
             style="height: 100%;margin-top: 8px;" bordered>
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'name'">
          {{ record.name }}
        </template>
        <template v-else-if="column.dataIndex === 'cookies' && record.cookiesArr">
          <div class="cookieClass">
            <div color="geekblue" v-for="(item, index) in record.cookiesArr" :key="index">
              <a-tag color="#2db7f5"> {{ JSON.stringify(item) }}</a-tag>
            </div>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'Action'">
          <div>
            <a-tooltip>
              <template #title>编辑</template>
              <FormOutlined
                  @click="$router.push({ path: '/edit', query: { row: JSON.stringify(record) } })"/>
            </a-tooltip>
            <a-divider type="vertical"/>
            <a-tooltip>
              <template #title>注入当前cookie</template>
              <RedoOutlined @click="injectCookie(record)"/>
            </a-tooltip>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script setup>
import {apiReqs} from '@/api'
import {FormOutlined, RedoOutlined} from '@ant-design/icons-vue';
import {message} from 'ant-design-vue';
import {ref, inject, onMounted, reactive} from 'vue';

const methods = inject('globalMethods');
const data = ref([]);
const usedCookie = ref({});
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '操作',
    dataIndex: 'Action',
    fixed: 'right'
  },
];
const searchFrom = reactive({
  searchValue: 'liblib_cookie',
});

const syncData = () => {
  methods.getStorage(('clientInfo'), (clientdata) => {
    apiReqs.getToken({
      url: "open/auth/token?client_id=" + clientdata.client_id + "&client_secret=" + clientdata.client_secret,
      success: (res) => {
        // 同步数据
        apiReqs.getData({
          url: "open/envs?searchValue=" + searchFrom.searchValue,
          headers: {
            "authorization": res['data']['token_type'] + ' ' + res['data']['token']
          },
          // 如果上传文件，则设置formData为true，这里暂时不用。
          success: (res) => {
            let datas = res.data
            if (Array.isArray(datas) && datas.length > 0) {
              const dataList = datas
                  .map((item) => ({
                    name: item.remarks,
                    cookiesArr: JSON.parse(item.value),
                  }));

              if (dataList.length === 0) {
                message.success('接口暂无有效数据');
                return;
              }
              data.value = dataList
            } else {
              message.success('接口暂无数据');
            }
          },
          fail: (res) => {
            console.log('接口获取数据失败', res)
            message.error('接口获取数据失败');
          },
        })
      },
      fail: (res) => {
        console.log('接口获取数据失败', res)
        message.error('接口获取数据失败');
      },
    })
  });
}

const injectCookie = (data) => {
  // 注入cookie 发送消息到 background.js
  if (!data.cookiesArr) {
    console.log('cookie为空')
  }
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    if (!tabs) {
      console.log('获取当前窗口域名失败')
    }
    chrome.runtime.sendMessage({action: 'injectCookie', data: data.cookiesArr, tabs: tabs}, (response) => {
      console.log('收到来自 background.js 的响应:', response);
      methods.setStorage({'usedCookie': data});
      usedCookie.value = data
    });
  });
}

onMounted(() => {
  syncData()
})
</script>
<style scoped>
.highlighted {
  color: #00BFFF;
}

.main {
  padding: 8px;
  flex: 1
}

.cookieClass {
  display: flex;
  flex-direction: column;
  overflow-y: hidden
}
</style>
