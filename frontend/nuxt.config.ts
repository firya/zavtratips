// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@pinia/nuxt"],
  vite: {
    vueJsx: {
      mergeProps: true,
    },
  },
});
