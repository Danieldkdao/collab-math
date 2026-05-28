"use client";

import { SetterType } from "@/lib/types";
import { Card, CardContent } from "../ui/card";
import { useEffect, useState } from "react";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ERROR_MESSAGE } from "@/lib/auth/constants";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Field, FieldDescription, FieldError } from "../ui/field";
import { Button } from "../ui/button";
import { LoadingSwap } from "../ui/loading-swap";

const formSchema = z.object({
  otp: z.string().length(6, { error: "OTP must be 6 characters long." }),
});

type FormType = z.infer<typeof formSchema>;

type VerifyOtpProps = {
  verifyEmail: string;
  setVerifyEmail: SetterType<string | null>;
};

export const VerifyOtp = ({ verifyEmail, setVerifyEmail }: VerifyOtpProps) => {
  const [timeToResend, setTimeToResend] = useState(30);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (timeToResend <= 0) return;
    const interval = setInterval(() => {
      if (timeToResend <= 0) return;
      setTimeToResend((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeToResend]);

  const onSubmit = async ({ otp }: FormType) => {
    await authClient.emailOtp.verifyEmail({
      email: verifyEmail,
      otp,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Email verified successfully!");
          router.push("/");
          setVerifyEmail(null);
        },
        onError: (error) => {
          toast.error(error.error.message || ERROR_MESSAGE);
        },
      },
    });
  };

  const resendOtp = async () => {
    if (timeToResend > 0) return;
    setLoading(true);
    await authClient.emailOtp.sendVerificationOtp({
      email: verifyEmail,
      type: "email-verification",
      fetchOptions: {
        onSuccess: () => {
          toast.success("OTP email sent successfully!");
          setTimeToResend(30);
        },
        onError: (error) => {
          toast.error(error.error.message || ERROR_MESSAGE);
        },
      },
    });
    setLoading(false);
  };

  const backToSignIn = async () => {
    await authClient.signOut({
      fetchOptions: {
        onError: (error) => {
          toast.error(error.error.message || ERROR_MESSAGE);
        },
      },
    });
    setVerifyEmail(null);
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 items-center">
          <div className="flex flex-col items-center space-y-1 mb-2">
            <h1 className="text-3xl font-bold">Verify Account</h1>
            <p className="text-base text-muted-foreground text-center">
              We have sent a verification code to {verifyEmail}. Enter the code
              below to verify your account.
            </p>
          </div>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <Controller
              name="otp"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="">
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup className="w-full min-w-0 flex justify-between gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  <FieldDescription className="text-center">
                    Enter the 6-digit code.
                  </FieldDescription>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting || loading}
              className="w-full"
            >
              <LoadingSwap isLoading={form.formState.isSubmitting}>
                Verify Account
              </LoadingSwap>
            </Button>
          </form>
          <div className="w-full flex justify-center items-center gap-2">
            <span>Didn't receive the code?</span>
            <Button
              variant="ghost"
              disabled={
                form.formState.isSubmitting || loading || timeToResend > 0
              }
              onClick={resendOtp}
              className="tabular-nums"
            >
              {timeToResend > 0 ? `Resend (${timeToResend})` : "Resend"}
            </Button>
          </div>
          <Button variant="ghost" onClick={backToSignIn}>
            Go Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
