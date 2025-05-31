"use server";

import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendArticleEmail = async (
  toEmail: string,
  pdfBuffer: Buffer,
  articleTitle: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Your App <noreply@yourdomain.com>",
      to: [toEmail],
      subject: `Your Article PDF: ${articleTitle}`,
      react: EmailTemplate({ articleTitle }),
      attachments: [
        {
          filename: `${articleTitle}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return { error: "Failed to send email" };
    }

    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { error: "Failed to send email" };
  }
};
