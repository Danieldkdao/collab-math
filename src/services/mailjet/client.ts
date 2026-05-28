import Mailjet from "node-mailjet";
import { envServer } from "@/data/env/server";

const DEFAULT_FROM_NAME = "CollabMath";

const mailjet = Mailjet.apiConnect(
  envServer.MAILJET_API_KEY,
  envServer.MAILJET_API_SECRET,
  {
    options: {
      timeout: 10_000,
    },
  },
);

type SendEmailOptions = {
  from?: string;
  fromName?: string;
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

export const sendEmail = async ({
  from = envServer.SENDER_EMAIL,
  fromName = DEFAULT_FROM_NAME,
  to,
  subject,
  html,
  text,
}: SendEmailOptions) => {
  const recipients = Array.isArray(to) ? to : [to];

  try {
    const response = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: from,
            Name: fromName,
          },
          To: recipients.map((email) => ({
            Email: email,
          })),
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
        },
      ],
    });

    return response.body;
  } catch (error) {
    console.error("Mailjet send failed.", {
      from,
      fromName,
      to: recipients,
      subject,
      error,
    });
    const message =
      error instanceof Error ? error.message : "Unknown Mailjet error";
    throw new Error(`Failed to send email with Mailjet: ${message}`);
  }
};
