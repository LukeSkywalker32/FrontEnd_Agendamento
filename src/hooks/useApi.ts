import type { AxiosRequestConfig } from "axios";
import { useCallback, useState } from "react";

import { api } from "../services/api";

interface UseApiState {
   isLoading: boolean;
   error: string | null;
}

export function useApi() {
   const [state, setState] = useState<UseApiState>({
      isLoading: false,
      error: null,
   });

   const request = useCallback(async <T>(config: AxiosRequestConfig) => {
      setState({
         isLoading: true,
         error: null,
      });
      try {
         const response = await api.request<T>(config);
         setState({ isLoading: false, error: null });
         return response.data;
      } catch (error) {
         setState({
            isLoading: false,
            error: "Não foi possível completar a operação.",
         });
         throw error;
      }
   }, []);
   const get = useCallback(
      <T>(url: string, config?: AxiosRequestConfig) => {
         return request<T>({ ...config, method: "GET", url });
      },
      [request],
   );

   const post = useCallback(
      <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) => {
         return request<T>({ ...config, method: "POST", url, data: body });
      },
      [request],
   );

   const put = useCallback(
      <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) => {
         return request<T>({ ...config, method: "PUT", url, data: body });
      },
      [request],
   );

   const remove = useCallback(
      <T>(url: string, config?: AxiosRequestConfig) => {
         return request<T>({ ...config, method: "DELETE", url });
      },
      [request],
   );

   return {
      isLoading: state.isLoading,
      error: state.error,
      get,
      post,
      put,
      remove,
   };
}
