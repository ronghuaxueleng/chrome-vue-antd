/*global chrome  全局*/
import { ref, readonly } from "vue";
const globalMethods = {
  getStorage: ref((name, callback) => {
    // 获取存储
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get([name], (result) => {
        if (callback) {
          callback(JSON.parse(result[name]));
        }
      });
    } else {
      callback(JSON.parse(localStorage.getItem(name)))
    }
  }),
  setStorage: ref((name, data) => {
    // 设置存储
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({name: data}, () => {
        console.log("Value is set:", {name: data});
      });
    } else {
      localStorage.setItem(name, data)
    }
  }),
  delAllStorage: ref(() => {
    // 删除所有存储
    chrome.storage.sync.clear(function () {
      console.log("All Storage has been removed.");
    });
  }),
};
export const MyPlugin = {
  install(app) {
    app.provide("globalMethods", readonly(globalMethods));
  },
};
