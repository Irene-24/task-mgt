import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";
import { API_URL } from "@/lib/constants";

import { AppState } from "@/redux/store";
import { clearCredentials, setCredentials } from "@/slices/auth.slice";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: async (headers, { getState }) => {
    const { userAuth } = getState() as AppState;
    headers.set("Authorization", `Bearer ${userAuth?.accessToken}`);
    return headers;
  },
});

const authQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
});

const mutex = new Mutex();

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (mutex.isLocked()) {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    } else {
      const release = await mutex.acquire();

      try {
        const refreshResult = await authQuery("/refresh", api, extraOptions);

        if (refreshResult.data) {
          api.dispatch(setCredentials(refreshResult.data));

          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(clearCredentials(true));
        }
      } catch {
        api.dispatch(clearCredentials(true));
      } finally {
        release();
      }
    }
  }
  return result;
};

const baseApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (build) => ({}),
  keepUnusedDataFor: 60 * 60, //Cache data for 1 hour
});

export { baseApi };
