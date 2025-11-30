import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { LoginBody, UsedAuthResponse, RegisterBody } from "@/types/auth.types";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
});

const authSessionApi = createApi({
  baseQuery,
  reducerPath: "authSessionApi",
  endpoints: (build) => ({
    login: build.mutation<UsedAuthResponse, LoginBody>({
      query: ({ email, password }) => ({
        url: `/login`,
        method: "POST",
        body: { email, password },
      }),
    }),
    refresh: build.mutation<UsedAuthResponse, void>({
      query: () => ({
        url: `/refresh`,
        method: "POST",
      }),
    }),
    logout: build.mutation<any, void>({
      query: () => ({
        url: `/logout`,
        method: "POST",
      }),
    }),
    register: build.mutation<UsedAuthResponse, RegisterBody>({
      query: (body) => ({
        url: `/register`,
        method: "POST",
        body,
      }),
    }),
  }),
});
export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useRegisterMutation,
} = authSessionApi;

export { authSessionApi };
