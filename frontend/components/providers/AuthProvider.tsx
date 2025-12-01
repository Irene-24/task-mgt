"use client";

import { useAppSelector } from "@/redux/redux-hooks";
import { useRefreshMutation } from "@/services/auth-session";
import React, {
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

const AuthProviderContent = ({ children }: PropsWithChildren) => {
  const hasRefreshedRef = useRef(false);
  const user = useAppSelector(selectCurrentAuth);
  const pathname = usePathname();
  const search = useSearchParams();

  const [shouldRender, setShouldRender] = useState(false);

  const [refresh] = useRefreshMutation();
  const router = useRouter();

  useLayoutEffect(() => {
    if (
      user.authStatus === AuthStatus.idle ||
      user.authStatus === AuthStatus.rejected
    ) {
      const queryString = search ? `&${search}` : "";
      const url = `/auth/login?redirect=${pathname}${queryString}`;

      if (user.showToast) {
        toast(
          "Your session has expired.\nYou will be redirected to login again",
          {
            duration: 2000,
          }
        );
        setTimeout(() => {
          router.push(url);
        }, 1800);
      } else {
        router.push(url);
      }
      return;
    }

    if (user.accessToken) {
      Promise.resolve().then(() => setShouldRender(true));
    } else if (!hasRefreshedRef.current) {
      hasRefreshedRef.current = true;
      refresh()
        .unwrap()
        .then(() => {
          setShouldRender(true);
        })
        .catch(() => {
          const url = `/auth/login?callbackUrl=${pathname}${encodeURIComponent(
            "?"
          )}${search?.toString()}`;
          router.push(url);
        });
    }
  }, [user, router, refresh, pathname, search]);

  if (!shouldRender || globalThis.window === undefined) {
    return (
      <div className="center w-full h-screen ">
        <LoaderCircle className="w-12 h-12" />
      </div>
    );
  }

  return <>{children}</>;
};

const AuthProvider = ({ children }: PropsWithChildren) => {
  return (
    <Suspense
      fallback={
        <div className="center w-full h-screen">
          <LoaderCircle className="w-12 h-12" />
        </div>
      }
    >
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  );
};

export default AuthProvider;
