// import { toValue } from "vue";
// import { UseFetchOptions } from "#app/composables/fetch";
import axios, { AxiosRequestConfig } from "axios";
import { useRuntimeConfig } from "#imports";

// export const Api = async <T>(
//   request: string,
//   opts?: UseFetchOptions<T>,
// ): Promise<T[]> => {
//   const config = useRuntimeConfig();
//
//   const { data } = await useFetch(request, {
//     baseURL: `${config.public.API_BASE_URL as string}/api`,
//     server: false,
//     ...opts,
//   });
//
//   return toValue(data) as T[];
// };

export const Api = async <T extends object>(
  request: string,
  opts?: AxiosRequestConfig<T>,
): Promise<T> => {
  const config = useRuntimeConfig();

  const { data } = await axios(request, {
    baseURL: `${config.public.API_BASE_URL as string}/api`,
    method: "get",
    ...opts,
  });

  return data as T;
};
