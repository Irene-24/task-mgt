"use client";

import { useAppSelector } from "@/redux/redux-hooks";
import { useRefreshMutation } from "@/services/auth-session";
import {
  useLayoutEffect,
  useRef,
  useState,
  PropsWithChildren,
  Suspense,
} from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { selectCurrentAuth } from "@/slices/auth.slice";
import { AuthStatus } from "@/types/auth.types";
import { LoaderCircle } from "lucide-react";

function buildLoginUrl(pathname: string, search: URLSearchParams | null) {
  const queryString = search?.toString();
  const separator = queryString ? "?" : "";
  return `/auth/login?callbackUrl=${pathname}${separator}${queryString || ""}`;
}

function LoadingSpinner() {
  return (
    <div className="center w-full h-screen">
      <LoaderCircle className="w-12 h-12 animate-spin" />
    </div>
  );
}

const AuthProviderContent = ({ children }: PropsWithChildren) => {
  const hasRefreshedRef = useRef(false);
  const user = useAppSelector(selectCurrentAuth);
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();

  const [shouldRender, setShouldRender] = useState(false);
  const [refresh] = useRefreshMutation();

  // Handle authentication state and token refresh
  useLayoutEffect(() => {
    const loginUrl = buildLoginUrl(pathname, search);

    // Allow auth page to render
    if (pathname.includes("/auth")) {
      Promise.resolve().then(() => setShouldRender(true));
      return;
    }

    // Redirect if session is idle or rejected
    if (
      user.authStatus === AuthStatus.idle ||
      user.authStatus === AuthStatus.rejected
    ) {
      router.push(loginUrl);
      return;
    }

    // Render if we have a valid token
    if (user.accessToken) {
      Promise.resolve().then(() => setShouldRender(true));
      return;
    }

    // Try to refresh token if not already attempted
    if (!hasRefreshedRef.current) {
      hasRefreshedRef.current = true;
      refresh()
        .unwrap()
        .then(() => setShouldRender(true))
        .catch(() => router.push(loginUrl));
    }
  }, [user, router, refresh, pathname, search]);

  // Show toast message when session expires
  useLayoutEffect(() => {
    if (user.authStatus === AuthStatus.idle && user.showToast) {
      toast(
        "Your session has expired.\nYou will be redirected to login again",
        {
          duration: 2000,
        }
      );
    }
  }, [user.authStatus, user.showToast]);

  if (!shouldRender || globalThis.window === undefined) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

const AuthProvider = ({ children }: PropsWithChildren) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  );
};

export default AuthProvider;
