import { useAppDispatch } from "@/redux/redux-hooks";
import { authSessionApi, useLogoutMutation } from "@/services/auth-session";
import { useCallback } from "react";
import { baseApi } from "@/services/base";
import { clearCredentials } from "@/slices/auth.slice";

const useLogout = () => {
  const dispatch = useAppDispatch();
  const [logoutUser] = useLogoutMutation();

  const logout = useCallback(async () => {
    await logoutUser().unwrap();
    dispatch(clearCredentials(false));
    dispatch(baseApi.util.resetApiState());
    dispatch(authSessionApi.util.resetApiState());
  }, [logoutUser, dispatch]);

  return { logout };
};

export default useLogout;
