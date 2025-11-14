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
import {reactive, inject, onMounted} from 'vue';
const methods = inject('globalMethods');
const addFrom = reactive({
  client_secret: '',
  client_id: ''
});
const onFinish = async values => {
  // 存储数据
  await methods.setStorage('clientInfo', JSON.stringify(values));
};
onMounted(() => {
    methods.getStorage(('clientInfo'), (data) => {
        addFrom.client_id = data.client_id
        addFrom.client_secret = data.client_secret
    });
})
</script>
