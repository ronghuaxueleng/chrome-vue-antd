import { createRouter, createWebHashHistory } from "vue-router";
import Entry from "@/option/views/entry/entry.vue";

const routes = [
  {
    path: "/",
    component: Entry,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
