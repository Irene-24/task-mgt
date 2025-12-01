import { useGetMeQuery } from "@/services/user";
import { UserRole } from "@/types/user.types";
import React from "react";

const useLoggedInUser = () => {
  const {
    data: user,
    isFetching,
    isLoading,
    isError,
    refetch,
    isSuccess,
  } = useGetMeQuery();

  const isAdmin = React.useMemo(() => {
    if (!user) return false;
    return user.role === UserRole.ADMIN;
  }, [user]);

  return { user, isFetching, isLoading, isError, refetch, isSuccess, isAdmin };
};

export default useLoggedInUser;
