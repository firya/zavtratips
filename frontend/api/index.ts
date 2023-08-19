import { UseFetchOptions } from "#app/composables/fetch";

export const Api = (request: string, opts?: UseFetchOptions<any>) => {
  const config = useRuntimeConfig();

  return useFetch(request, {
    baseURL: `${config.public.API_BASE_URL as string}/api`,
    ...opts,
  });
};
