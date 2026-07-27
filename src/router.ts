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
      meta: {
        backRouteName: "catalog",
        backLabel: "Voltar ao catálogo",
      },
    },
    {
      path: "/realidade-aumentada",
      name: "ar-hub",
      component: () => import("./views/ArHubView.vue"),
      meta: {
        backRouteName: "catalog",
        backLabel: "Voltar ao catálogo",
      },
    },
    {
      path: "/realidade-aumentada/ambiente",
      name: "ar-environment",
      component: () => import("./views/ArHubView.vue"),
      meta: {
        backRouteName: "ar-hub",
        backLabel: "Voltar aos modos de realidade aumentada",
      },
    },
    {
      path: "/realidade-aumentada/cards",
      name: "ar-card-collection",
      component: () => import("./views/ArHubView.vue"),
      meta: {
        backRouteName: "ar-hub",
        backLabel: "Voltar aos modos de realidade aumentada",
      },
    },
    {
      path: "/cards-ra",
      name: "ar-cards",
      component: () => import("./views/ArCardsView.vue"),
      meta: {
        backRouteName: "catalog",
        backLabel: "Voltar ao catálogo",
      },
    },
    {
      path: "/cards-ra/imprimir",
      name: "ar-cards-print",
      component: () => import("./views/ArCardsPrintView.vue"),
      meta: {
        backRouteName: "ar-cards",
        backLabel: "Voltar aos cards",
      },
    },
    {
      path: "/diagnostico",
      name: "diagnostics",
      component: () => import("./views/DiagnosticsView.vue"),
      meta: {
        backRouteName: "catalog",
        backLabel: "Voltar ao catálogo",
      },
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
