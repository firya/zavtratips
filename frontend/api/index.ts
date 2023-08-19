import { UseFetchOptions } from "#app/composables/fetch";

export const Api = async <T>(request: string, opts?: UseFetchOptions<T>) => {
  const config = useRuntimeConfig();

  return (
    await useFetch(request, {
      baseURL: `${config.public.API_BASE_URL as string}/api`,
      ...opts,
    })
  ).data;
};
