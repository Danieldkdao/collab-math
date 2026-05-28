import { sendEmail } from "../client";

const APP_NAME = "CollabMath";

type OtpEmailType =
  | "sign-in"
  | "change-email"
  | "email-verification"
  | "forget-password";

type SendVerificationOtpProps = {
  email: string;
  otp: string;
  type: OtpEmailType;
};

const OTP_EMAIL_CONTENT: Record<
  OtpEmailType,
  {
    preview: string;
    subject: string;
    heading: string;
    body: string;
    note: string;
  }
> = {
  "sign-in": {
    preview: `Use this code to securely sign in to ${APP_NAME}.`,
    subject: `${APP_NAME} - Your sign in code`,
    heading: "Your sign in code",
    body: `Use the verification code below to finish signing in to your ${APP_NAME} account.`,
    note: "If you did not try to sign in, you can safely ignore this email.",
  },
  "change-email": {
    preview: "Confirm your new email address with this code.",
    subject: `${APP_NAME} - Confirm your new email`,
    heading: "Confirm your new email",
    body: `Use the verification code below to confirm the email address change for your ${APP_NAME} account.`,
    note: "If you did not request this change, please review your account security.",
  },
  "email-verification": {
    preview: "Verify your email address to finish setting up your account.",
    subject: `${APP_NAME} - Verify your email`,
    heading: "Verify your email",
    body: `Welcome to ${APP_NAME}. Use the verification code below to verify your email address and complete setup.`,
    note: "If you did not create an account, you can ignore this email.",
  },
  "forget-password": {
    preview: `Use this code to reset your ${APP_NAME} password.`,
    subject: `${APP_NAME} - Reset your password`,
    heading: "Reset your password",
    body: `Use the verification code below to continue resetting your ${APP_NAME} password.`,
    note: "If you did not request a password reset, no changes have been made to your account.",
  },
};

export const sendVerificationOtp = async ({
  email,
  otp,
  type,
}: SendVerificationOtpProps) => {
  const content = OTP_EMAIL_CONTENT[type];
  const html = `
    <div style="margin:0;padding:32px 16px;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#102a43;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        ${content.preview}
      </div>
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d9e2ec;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(15, 23, 42, 0.08);">
        <div style="padding:32px 32px 20px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);color:#ffffff;">
          <p style="margin:0 0 12px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.8;">${APP_NAME}</p>
          <h1 style="margin:0;font-size:30px;line-height:1.2;">${content.heading}</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#243b53;">
            ${content.body}
          </p>
          <div style="margin:24px 0;padding:24px;border-radius:16px;background:#eff6ff;border:1px solid #bfdbfe;text-align:center;">
            <p style="margin:0 0 10px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#1d4ed8;font-weight:700;">
              Verification code
            </p>
            <p style="margin:0;font-size:36px;line-height:1;letter-spacing:0.32em;font-weight:800;color:#0f172a;">
              ${otp}
            </p>
          </div>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#486581;">
            This code was requested for <strong>${email}</strong>.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#486581;">
            ${content.note}
          </p>
        </div>
      </div>
    </div>
  `;
  const text = [
    content.heading,
    "",
    content.body,
    "",
    `Verification code: ${otp}`,
    "",
    `Requested for: ${email}`,
    "",
    content.note,
  ].join("\n");

  try {
    await sendEmail({
      fromName: APP_NAME,
      to: email,
      subject: content.subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Unexpected error while sending verification OTP email.", {
      email,
      type,
      error,
    });
    throw error;
  }
};
