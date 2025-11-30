import {
  configureStore,
  ThunkAction,
  Middleware,
  combineReducers,
} from "@reduxjs/toolkit";
import { Action } from "redux";

import { userAuthSlice } from "@/slices/auth.slice";

import { baseApi } from "@/services/base";
import { authSessionApi } from "@/services/auth-session";

const middlewares: Middleware[] = [
  baseApi.middleware,
  authSessionApi.middleware,
];

const appReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  [authSessionApi.reducerPath]: authSessionApi.reducer,

  [userAuthSlice.name]: userAuthSlice.reducer,
});

export const store = configureStore({
  reducer: appReducer,
  devTools: process.env.NODE_ENV === "development",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middlewares),
});

export type AppState = Required<ReturnType<typeof store.getState>>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export function setupStore(preloadedState?: Partial<AppState>) {
  return configureStore({
    reducer: appReducer,
    preloadedState,
  });
}
