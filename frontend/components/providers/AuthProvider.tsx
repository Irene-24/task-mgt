"use client";

import { useAppSelector } from "@/redux/redux-hooks";
import { useRefreshMutation } from "@/services/auth-session";
import React, {
  useLayoutEffect,
  useRef,
  useState,
  PropsWithChildren,
} from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { selectCurrentAuth } from "@/slices/auth.slice";
import { AuthStatus } from "@/types/auth.types";
import { LoaderCircle } from "lucide-react";

const AuthProvider = ({ children }: PropsWithChildren) => {
  const hasRefreshedRef = useRef(false);
  const user = useAppSelector(selectCurrentAuth);
  const pathname = usePathname();
  const search = useSearchParams();

  const [shouldRender, setShouldRender] = useState(false);

  const [refresh] = useRefreshMutation();
  const router = useRouter();

  useLayoutEffect(() => {
    if (user.authStatus === AuthStatus.idle) {
      if (!pathname.includes("/login")) {
        const queryString = search ? `&${search}` : "";
        router.push(`/auth/login?redirect=${pathname}${queryString}`);
      }
    }

    if (user.authStatus === AuthStatus.rejected) {
      const url = `/auth/login?callbackUrl=${pathname}${encodeURIComponent(
        "?"
      )}${search?.toString()}`;

      router.push(url);
    }

    if (user.accessToken) {
      // schedule the state update as a microtask to avoid synchronous setState inside the effect
      Promise.resolve().then(() => setShouldRender(true));
    } else if (hasRefreshedRef.current) {
      return;
    } else {
      (async () => {
        hasRefreshedRef.current = true;
        await refresh()
          .unwrap()
          .then((data) => {
            setShouldRender(true);
          })
          .catch(() => {
            const url = `/auth/login?callbackUrl=${pathname}${encodeURIComponent(
              "?"
            )}${search?.toString()}`;

            router.push(url);
          });
      })();
    }
  }, [user, router, refresh, pathname, search]);

  useLayoutEffect(() => {
    const url = `/auth/login?callbackUrl=${pathname}${encodeURIComponent(
      "?"
    )}${search?.toString()}`;

    if (user.authStatus === AuthStatus.idle) {
      if (user.showToast) {
        toast(
          "Your session has expired.\n You will be redirected to login again",
          {
            duration: 2000,
          }
        );
        setTimeout(() => {
          router.push(url);
        }, 1800);

        return;
      } else {
        router.push(url);
      }
    }
  }, [router, user, pathname, search]);

  if (!shouldRender || globalThis.window === undefined) {
    return (
      <div className="center w-full h-screen ">
        <LoaderCircle className="w-12 h-12" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
