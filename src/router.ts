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
      path: "/cards-ra",
      name: "ar-cards",
      component: () => import("./views/ArCardsView.vue"),
    },
    {
      path: "/cards-ra/imprimir",
      name: "ar-cards-print",
      component: () => import("./views/ArCardsPrintView.vue"),
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
  scrollBehavior: (to, _from, savedPosition) => {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, top: 24 };
    return { top: 0 };
  },
});
