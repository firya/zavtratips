import axios, { AxiosRequestConfig } from "axios";
import { useRuntimeConfig } from "#imports";

export const Api = async <T extends object>(
  request: string,
  opts?: AxiosRequestConfig<T>,
): Promise<T> => {
  const config = useRuntimeConfig();

  const { data } = await axios(request, {
    baseURL: `${config.public.API_BASE_URL as string}/api`,
    method: "get",
    ...opts,
    params: {
      ...(opts?.params || {}),
      // @ts-expect-error telegram type
      initData: window.Telegram.WebApp.initData,
    },
  });

  return data as T;
};
