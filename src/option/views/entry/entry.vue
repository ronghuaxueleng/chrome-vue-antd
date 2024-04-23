<template>
  <div style="padding:18px">
    <a-form name="add" :model="addFrom" @finish="onFinish">
      <a-form-item label="client_id" name="client_id" :rules="[{ required: true, message: '请输入!' }]">
        <a-input v-model:value="addFrom.client_id" />
      </a-form-item>
      <a-form-item label="client_secret" name="client_secret" :rules="[{ required: true, message: '请输入!' }]">
        <a-input v-model:value="addFrom.client_secret" />
      </a-form-item>
      <a-form-item style="text-align: center;">
        <a-button type="primary" html-type="submit">提交</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { reactive, inject } from 'vue';
import { message } from 'ant-design-vue';
const methods = inject('globalMethods');
const addFrom = reactive({
  client_secret: '',
  client_id: ''
});
const onFinish = async values => {
  // 提交
  methods.getStorage(('cookie'), async (data) => {
    let newdata = [];
    if (Array.isArray(data) && data.length > 0) {
      const existingName = data.findIndex(item => item.name === values.name);
      if (existingName !== -1) {
        message.error('name已存在')
        return
      }
      newdata = [values,...data];
    } else {
      newdata = [values];
    }
    // 存储数据
    await methods.setStorage({ 'cookie': newdata });
  });
};
</script>
