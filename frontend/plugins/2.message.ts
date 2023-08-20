import { defineNuxtPlugin, useNuxtApp } from "#imports";

export default defineNuxtPlugin((nuxtApp) => {
  const { $pinia } = useNuxtApp();
  $pinia.use(({ store }) => {
    store.$message = nuxtApp.vueApp.config.globalProperties.$toast;
  });
});
