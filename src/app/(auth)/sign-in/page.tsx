"use client";

import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { useEffect, useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa6";
import { Separator } from "@/components/ui/separator";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { inputErrorBorder } from "@/lib/utils";
import Link from "next/link";
import { SendIcon } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { ERROR_MESSAGE } from "@/lib/auth/constants";
import {
  PasswordInput,
  PasswordInputStrengthChecker,
} from "@/components/ui/password-input";
import { VerifyOtp } from "@/components/auth/verify-otp";

const formSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." }),
});

type FormType = z.infer<typeof formSchema>;

const SignInSchema = () => {
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const { data: session } = authClient.useSession.get();
  const [socialSignInLoading, setSocialSignInLoading] = useState(false);
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (session && !session.user.emailVerified) {
      authClient.emailOtp
        .sendVerificationOtp({
          email: session.user.email,
          type: "email-verification",
        })
        .then(() => setVerifyEmail(session.user.email));
    }
  }, [session]);

  const onSubmit = async (data: FormType) => {
    await authClient.signIn.email({
      ...data,
      callbackURL: "/",
      fetchOptions: {
        onSuccess: () => {
          toast.success("Sign in successful!");
        },
        onError: async (error) => {
          if (error.error.code === "EMAIL_NOT_VERIFIED") {
            await authClient.emailOtp.sendVerificationOtp({
              email: data.email,
              type: "email-verification",
            });
            setVerifyEmail(data.email);
            return;
          }
          toast.error(error.error.message || ERROR_MESSAGE);
        },
      },
    });
  };

  const onSocialSignIn = async (provider: "google" | "github") => {
    setSocialSignInLoading(true);
    await authClient.signIn.social({
      provider,
      callbackURL: "/",
      fetchOptions: {
        onError: (error) => {
          toast.error(error.error.message || ERROR_MESSAGE);
        },
      },
    });
    setSocialSignInLoading(false);
  };

  const isPending = form.formState.isSubmitting || socialSignInLoading;

  if (verifyEmail) {
    return (
      <VerifyOtp verifyEmail={verifyEmail} setVerifyEmail={setVerifyEmail} />
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 items-center">
          <div className="flex flex-col items-center space-y-1 mb-2">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-base text-muted-foreground">
              Please sign in to continue
            </p>
          </div>
          <div className="space-y-2 w-full">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSocialSignIn("github")}
              disabled={isPending}
            >
              <LoadingSwap isLoading={isPending}>
                <div className="flex items-center gap-2">
                  <FaGithub />
                  Continue with GitHub
                </div>
              </LoadingSwap>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSocialSignIn("google")}
              disabled={isPending}
            >
              <LoadingSwap isLoading={isPending}>
                <div className="flex items-center gap-2">
                  <FaGoogle />
                  Continue with Google
                </div>
              </LoadingSwap>
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Separator className="flex-1" />
            <span className="text-muted-foreground font-medium">
              Or continue with
            </span>
            <Separator className="flex-1" />
          </div>
          <form
            className="w-full space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    {...field}
                    placeholder="example@email.com"
                    className={inputErrorBorder(fieldState.error)}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <div className="flex items-center gap-2 justify-between flex-wrap">
                    <FieldLabel>Password</FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <PasswordInput
                    {...field}
                    placeholder="••••••••"
                    className={inputErrorBorder(fieldState.error)}
                  >
                    <PasswordInputStrengthChecker />
                  </PasswordInput>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button className="w-full" disabled={isPending}>
              <LoadingSwap isLoading={isPending}>
                <div className="flex items-center gap-2">
                  <SendIcon />
                  Continue
                </div>
              </LoadingSwap>
            </Button>
          </form>
          <Link
            href="/sign-up"
            className="text-muted-foreground text-sm font-medium text-center"
          >
            Don't have an account? Sign up here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignInSchema;
