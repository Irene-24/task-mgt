"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/ui/password-input";
import { getAPIErrMessage, handleFormErrors } from "@/helpers/errorHelpers";
import AuthHeader from "@/components/Auth/AuthHeader";
import { useLoginMutation } from "@/services/auth-session";
import { cn } from "@/lib/utils";
import { FORM_STYLES } from "@/lib/app-styles";

const schema = z.object({
  email: z.email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SchemaType = z.infer<typeof schema>;

const defaultValues: SchemaType = { email: "", password: "" };

const LoginForm = () => {
  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const [login, { isLoading }] = useLoginMutation();

  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const handleSubmit = async (data: SchemaType) => {
    toast.dismiss();
    toast.loading("Logging you in...");

    try {
      await login(data).unwrap();

      let searchQ = decodeURIComponent(search?.toString());

      searchQ = searchQ?.replace("callbackUrl=", "") || "";

      const url =
        `${pathname.replace("/auth/login", "")}${searchQ}` || "/dashboard";

      router.push(url);

      toast.dismiss();
      toast.success("Login successful");
    } catch (error) {
      console.log({ error });
      toast.dismiss();

      toast.error(getAPIErrMessage({ error }, "Unable to log in"));
    }
  };

  return (
    <div className="">
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to your account to continue"
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit, handleFormErrors)}
          className={cn(FORM_STYLES.auth_form)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className={`px-0.5`}>
                <FormLabel className={cn(FORM_STYLES.auth_label)}>
                  Email address
                </FormLabel>
                <FormControl>
                  <Input className={cn(FORM_STYLES.auth_input)} {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className={`px-0.5`}>
                <FormLabel className={cn(FORM_STYLES.auth_label)}>
                  Password
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    className={cn(FORM_STYLES.auth_input)}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <p className={cn(FORM_STYLES.alt_action)}>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className=" hover:underline text-primary"
            >
              Sign up instead
            </Link>
          </p>

          <Button
            disabled={isLoading}
            className={cn(FORM_STYLES.submitBtn, {
              "animate-pulse": isLoading,
            })}
            type="submit"
          >
            Log In
          </Button>
        </form>
      </Form>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;
