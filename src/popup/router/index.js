import { createRouter, createWebHashHistory } from "vue-router";
import MainList from "@/popup/views/mainList/mainList.vue";
import Entry from "@/popup/views/entry/entry.vue";

const routes = [
  {
    path: "/",
    component: Entry,
    children: [
      {
        path: "mainList",
        component: MainList,
        exact: true,
      },
      { path: "", redirect: "mainList" },
      { path: "/:pathMatch(.*)", redirect: "mainList" },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
