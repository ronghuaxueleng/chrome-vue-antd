<template>
    <div class="main">
        <a-space-compact>
            <a-form layout="inline" name="syncData" :model="searchFrom" @finish="syncData">
                <a-form-item>
                    <a-select
                        v-model:value="searchFrom.searchValue"
                        :size="size"
                        style="width: 100px"
                        :options="options"
                        @change="handleChange"
                    ></a-select>
                </a-form-item>
                <a-form-item style="text-align: center;">
                    <a-button type="primary" html-type="submit">同步</a-button>
                </a-form-item>
                <a-form-item>
                    <DeleteOutlined @click="clearCookie">清除cookie</DeleteOutlined>
                    <a-divider type="vertical"/>
                    <SyncOutlined @click="updateCookie">更新</SyncOutlined>
                    <a-divider type="vertical"/>
                    <a-button type="link" :href="option.url" target="_blank">Link</a-button>
                    <a-divider type="vertical"/>
                    <WechatOutlined @click="copywxurl()">微信登录</WechatOutlined>
                    <a-divider type="vertical"/>
                    <QqOutlined @click="copyqqurl()">QQ登录</QqOutlined>
                    <a-divider type="vertical"/>
                    <PhoneOutlined @click="copyphoneurl()">手机号登录</PhoneOutlined>
                </a-form-item>
            </a-form>
        </a-space-compact>
        <a-table :columns="columns" :data-source="data" :scroll="{ x: '100%' }" size='small'
                 style="height: 100%;margin-top: 8px;" bordered>
            <template #bodyCell="{ column, record, index }">
                <template v-if="column.dataIndex === 'name'">
                    <a-badge v-if="record.status===1" status="error" :text="record.name" @click="copyphone(record)"/>
                    <a-badge v-else-if="record.name===usedCookie.name" status="processing" :text="record.name" @click="copyphone(record)"/>
                    <a-badge v-else status="success" :text="record.name" @click="copyphone(record)"/>
                </template>
                <template v-else-if="column.dataIndex === 'Action'">
                    <div>
                        <a-divider type="vertical"/>
                        <a-tooltip>
                            <template #title>注入当前cookie</template>
                            <AimOutlined @click="injectCookie(record)"/>
                        </a-tooltip>
                        <a-divider type="vertical"/>
                        <a-tooltip>
                            <template #title>获取当前cookieId</template>
                            <HighlightOutlined @click="getCookieId(record)"/>
                        </a-tooltip>
                        <span v-if="record.sourcetype==='微信'">
                            <a-divider type="vertical"/>
                            <a-tooltip>
                                <template #title>获取微信二维码</template>
                                <WechatOutlined @click="copywxurl(record)"/>
                            </a-tooltip>
                        </span>
                        <span v-if="record.sourcetype==='qq'">
                            <a-divider type="vertical"/>
                            <a-tooltip>
                                <template #title>获取QQ二维码</template>
                                <QqOutlined @click="copyqqurl(record)"/>
                            </a-tooltip>
                        </span>
                        <span v-if="record.sourcetype==='邮箱'">
                            <a-divider type="vertical"/>
                            <a-tooltip>
                                <template #title>邮箱登录</template>
                                <ForwardOutlined @click="emaillogin(record)"/>
                            </a-tooltip>
                        </span>
                        <span v-if="record.sourcetype==='手机号'">
                            <a-divider type="vertical"/>
                            <a-tooltip>
                                <template #title>手机号登录</template>
                                <PhoneOutlined @click="copyphoneurl(record)"/>
                            </a-tooltip>
                        </span>
                    </div>
                </template>
            </template>
        </a-table>
    </div>
</template>
<script setup>
import {apiReqs} from '@/api'
import {SyncOutlined, DeleteOutlined, AimOutlined, HighlightOutlined, WechatOutlined, QqOutlined, ForwardOutlined, PhoneOutlined} from '@ant-design/icons-vue';
import {message} from 'ant-design-vue';
import {ref, inject, onMounted, reactive, watch} from 'vue';

// const domain = 'http://192.144.215.218:5000'
const domain = 'http://qrcode.ronghuaxueleng.top'
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
const size = ref('default');
const options = ref([
    {
        "value": "liblib_cookie",
        "label": "哩布哩布"
    },
    {
        "value": "shakker_cookie",
        "label": "Shakker AI"
    }
]);
const optionMap = ref({
    "liblib_cookie": {
        "siteName": "哩布哩布",
        "cookieName": "liblib_cookie",
        "url": "https://www.liblib.art/message"
    },
    "shakker_cookie": {
        "siteName": "Shakker AI",
        "cookieName": "shakker_cookie",
        "url": "https://www.shakker.ai/message"
    }
});
const option = ref({
    "siteName": "哩布哩布",
    "cookieName": "liblib_cookie",
    "url": "https://www.liblib.art/message"
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
                        console.log(datas)
                        if (Array.isArray(datas) && datas.length > 0) {
                            const dataList = datas
                                .map((item) => ({
                                    id: item.id,
                                    status: item.status,
                                    remarks: item.remarks,
                                    username: item.username,
                                    sourcetype: item.sourcetype,
                                    cookiesArr: JSON.parse(item.value),
                                    name: item.remarks + (!!item.username ? ('-' + item.username) : ""),
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

const clearCookie = () => {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.runtime.sendMessage({action: 'delCookie', tabs: tabs}, (response) => {
            console.log('收到来自 background.js 的响应:', response);
        });
    })
}

const getCookieId = (data) => {
    usedCookie.value = data;
}

const copyphone = (data) => {
    if (data.sourcetype === '手机号' || data.sourcetype === '邮箱') {
        navigator.clipboard.writeText(data.remarks)
    }
}

const copywxurl = (data) => {
    let url = domain + '/wx-qrcode?t=' + new Date().getTime()
    if (data !== undefined) {
        url += '&id=' + data.id
    }
    navigator.clipboard.writeText(url)
}

const copyqqurl = (data) => {
    let url = domain + '/qq-qrcode?t=' + new Date().getTime()
    if (data !== undefined) {
        url += '&id=' + data.id
    }
    navigator.clipboard.writeText(url)
}

const copyphoneurl = (data) => {
    let url = domain + '/phone-login?t=' + new Date().getTime()
    if (data !== undefined) {
        url += '&id=' + data.id + '&phone=' + data.remarks
    }
    navigator.clipboard.writeText(url)
}

const emaillogin = (data) => {
    let url = domain + '/email-login?t=' + new Date().getTime()
    url += '&id=' + data.id + '&email=' + data.remarks
    navigator.clipboard.writeText(url)
    window.open(url, '_blank')
}

const injectCookie = (data) => {
    if (!data.cookiesArr) {
        console.log('cookie为空')
        return
    }
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (!tabs) {
            console.log('获取当前窗口域名失败')
        }
        chrome.runtime.sendMessage({action: 'injectCookie', data: data.cookiesArr, tabs: tabs}, (response) => {
            console.log('收到来自 background.js 的响应:', response);
            methods.setStorage('usedCookie', JSON.stringify(data));
            usedCookie.value = data
            console.log('当前选中的用户', usedCookie);
            console.log('当前选中的用户', usedCookie.value);
        });
    });
}

const updateCookie = () => {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (!tabs) {
            console.log('获取当前窗口域名失败')
        }
        var currentTab = tabs[0];
        chrome.cookies.getAll({url: currentTab.url}, (cookies) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            } else {
                // 为每个cookie设置过期时间为一年后
                cookies.forEach(cookie => {
                    cookie.expirationDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
                });
                const url = "https://gist.githubusercontent.com/ronghuaxueleng/4423ea3d530b9e758c7dd47a456e9c3f/raw/3463a589618728812fb220d1085406914b74c821/cookie_names.json"
                fetch(url).then((res) => res.json())
                    .then((result) => {
                        methods.getStorage(('clientInfo'), (clientdata) => {
                            apiReqs.getToken({
                                url: "open/auth/token?client_id=" + clientdata.client_id + "&client_secret=" + clientdata.client_secret,
                                success: (tokenRes) => {
                                    // 同步数据
                                    apiReqs.updateData({
                                        url: "open/envs",
                                        method: 'put',
                                        headers: {
                                            "authorization": tokenRes['data']['token_type'] + ' ' + tokenRes['data']['token']
                                        },
                                        data: {
                                            "name": option.value.cookieName,
                                            "id": usedCookie.value.id,
                                            "value": JSON.stringify(cookies),
                                        },
                                        // 如果上传文件，则设置formData为true，这里暂时不用。
                                        success: (res) => {
                                            apiReqs.updateData({
                                                url: "open/envs/enable",
                                                method: 'put',
                                                headers: {
                                                    "authorization": tokenRes['data']['token_type'] + ' ' + tokenRes['data']['token']
                                                },
                                                data: [usedCookie.value.id],
                                                // 如果上传文件，则设置formData为true，这里暂时不用。
                                                success: (res) => {
                                                    syncData()
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
                                },
                                fail: (res) => {
                                    console.log('接口获取数据失败', res)
                                    message.error('接口获取数据失败');
                                },
                            })
                        });
                    })
            }
        });
    });
}

onMounted(() => {
    // 从存储中获取上次选中的网站
    if (chrome && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(['lastSelectedSite'], (result) => {
            if (result.lastSelectedSite) {
                searchFrom.searchValue = result.lastSelectedSite;
                option.value = optionMap.value[result.lastSelectedSite];
            }
            syncData()
        });
    } else {
        const storedSite = localStorage.getItem('lastSelectedSite');
        if (storedSite) {
            searchFrom.searchValue = storedSite;
            option.value = optionMap.value[storedSite];
        }
        syncData()
    }
})
const handleChange = (value) => {
    option.value = optionMap.value[value]
    // 保存选中的网站到存储中
    methods.setStorage('lastSelectedSite', value);
    syncData()
};
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
