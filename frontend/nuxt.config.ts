// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      script: ["https://telegram.org/js/telegram-web-app.js"],
    },
  },
  modules: ["@pinia/nuxt"],
  runtimeConfig: {
    public: {
      API_BASE_URL:
        process.env.NODE_ENV === "production"
          ? process.env.HOST_URL
          : `http://localhost:${process.env.NODE_PORT}`,
    },
  },
  build: {
    transpile: ["primevue"],
  },
  vite: {
    vueJsx: {
      mergeProps: true,
    },
  },
  css: [
    "primeicons/primeicons.css",
    "primevue/resources/themes/lara-light-blue/theme.css",
    "@/assets/css/global.css",
  ],
  ssr: false,
  imports: {
    autoImport: false,
  },
});
