// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
    transpile:
      process.env.NODE_ENV === "production"
        ? [
            "naive-ui",
            "vueuc",
            "@css-render/vue3-ssr",
            "@juggle/resize-observer",
          ]
        : ["@juggle/resize-observer"],
  },
  vite: {
    optimizeDeps: {
      include:
        process.env.NODE_ENV === "dev"
          ? ["naive-ui", "vueuc", "date-fns-tz/esm/formatInTimeZone"]
          : [],
    },
    vueJsx: {
      mergeProps: true,
    },
  },
});
