import nodemailer from "nodemailer";

export class MailConfigurationError extends Error {
  constructor() {
    super("Password reset email service is not configured");
    this.name = "MailConfigurationError";
  }
}

const getMailTransport = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    throw new MailConfigurationError();
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
};

export const sendPasswordResetOtp = async (email: string, otp: string) => {
  const from = process.env.SMTP_USER;
  const transport = getMailTransport();

  await transport.sendMail({
    from,
    to: email,
    subject: "Your MERN-GPT password reset OTP",
    text: `Your password reset OTP is ${otp}. It expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #17212b; line-height: 1.6; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #087f8c;">Reset your MERN-GPT password</h2>
        <p>We received a request to reset the password for your account.</p>
        <p>Your one-time verification code is:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #087f8c;">${otp}</p>
        <p>This code expires in <strong>10 minutes</strong> and can be used only once.</p>
        <p>If you did not request a password reset, no action is required.</p>
        <p>Regards,<br />The MERN-GPT team</p>
      </div>
    `,
  });
};
