"use client";

import Link from "next/link";

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
import { cn } from "@/lib/utils";
import { FORM_STYLES } from "@/lib/app-styles";
import { ROLE_LIST, UserRole } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/services/auth-session";

const registerSchema = z
  .object({
    email: z.email("Please provide a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    role: z.enum(ROLE_LIST).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SchemaType = z.infer<typeof registerSchema>;

const defaultValues: SchemaType = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  role: UserRole.USER,
};

const RegisterPage = () => {
  const form = useForm<SchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues,
  });

  const router = useRouter();

  const [register, { isLoading }] = useRegisterMutation();

  const handleSubmit = async (data: SchemaType) => {
    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...registerData } = data;

    toast.dismiss();
    toast.loading("Creating your account...");

    try {
      await register(registerData).unwrap();

      toast.dismiss();
      toast.success(
        "Registration successful. You will be redirected to your dashboard soon."
      );

      router.push("/dashboard");
    } catch (error) {
      toast.dismiss();

      toast.error(getAPIErrMessage({ error }, "Unable to register"));
    }
  };

  return (
    <div className="">
      <AuthHeader title="Create an account" subtitle="Sign up to get started" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit, handleFormErrors)}
          className={cn(FORM_STYLES.auth_form)}
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className={`px-0.5`}>
                <FormLabel className={cn(FORM_STYLES.auth_label)}>
                  First Name
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
            name="lastName"
            render={({ field }) => (
              <FormItem className={`px-0.5`}>
                <FormLabel className={cn(FORM_STYLES.auth_label)}>
                  Last Name
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
            name="email"
            render={({ field }) => (
              <FormItem className={`px-0.5`}>
                <FormLabel className={cn(FORM_STYLES.auth_label)}>
                  Email address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    className={cn(FORM_STYLES.auth_input)}
                    {...field}
                  />
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className={`px-0.5`}>
                <FormLabel className={cn(FORM_STYLES.auth_label)}>
                  Confirm Password
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
            Already have an account?{" "}
            <Link href="/auth/login" className=" hover:underline text-primary">
              Sign in instead
            </Link>
          </p>

          <Button
            disabled={isLoading}
            className={cn(FORM_STYLES.submitBtn, {
              "animate-pulse": isLoading,
            })}
            type="submit"
          >
            Create Account
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterPage;
