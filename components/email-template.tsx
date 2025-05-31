import * as React from "react";

interface EmailTemplateProps {
  articleTitle: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  articleTitle,
}) => (
  <div>
    <h1>Your Article PDF is Ready!</h1>
    <p>
      Thank you for using our service. Attached is your PDF for the article:
    </p>
    <strong>{articleTitle}</strong>
    <p>
      Best regards,
      <br />
      Your App Team
    </p>
  </div>
);
