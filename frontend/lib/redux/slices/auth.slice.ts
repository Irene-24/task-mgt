import { createSlice, isAnyOf, PayloadAction } from "@reduxjs/toolkit";
import { authSessionApi } from "@/lib/redux/services/auth-session";
import { UsedAuthResponse, AuthState, AuthStatus } from "@/types/auth.types";

const initialState: AuthState = {
  accessToken: "",
  userId: "",
  authStatus: AuthStatus.pending,
  showToast: true,
};

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    clearCredentials: (state, action: PayloadAction<boolean | undefined>) => {
      const newState = {
        ...initialState,
        authStatus: AuthStatus.idle,
        showToast: action?.payload || false,
      };
      return newState;
    },

    setCredentials: (state, { payload }) => {
      state = {
        ...state,
        ...payload,
        authStatus: AuthStatus.resolved,
        showToast: false,
      };

      return state;
    },
  },
  selectors: {
    selectCurrentAuth: (state) => state,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(
          authSessionApi.endpoints.login.matchFulfilled,
          authSessionApi.endpoints.register.matchFulfilled,
          authSessionApi.endpoints.refresh.matchFulfilled
        ),
        (state, { payload }: PayloadAction<UsedAuthResponse>) => {
          state.accessToken = payload.accessToken;
          state.userId = payload.userId;
          state.authStatus = AuthStatus.resolved;
          state.showToast = false;
        }
      )

      .addMatcher(
        isAnyOf(
          authSessionApi.endpoints.login.matchRejected,
          authSessionApi.endpoints.refresh.matchRejected
        ),
        (state) => {
          state.authStatus = AuthStatus.rejected;
        }
      );
  },
});

export const { clearCredentials, setCredentials } = userAuthSlice.actions;
export const { selectCurrentAuth } = userAuthSlice.selectors;

export { userAuthSlice };
