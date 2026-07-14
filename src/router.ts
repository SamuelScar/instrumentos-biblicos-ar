import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "catalog",
      component: () => import("./views/CatalogView.vue"),
    },
    {
      path: "/instrumentos/:instrumentId",
      name: "instrument",
      component: () => import("./views/InstrumentView.vue"),
    },
    {
      path: "/diagnostico",
      name: "diagnostics",
      component: () => import("./views/DiagnosticsView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
