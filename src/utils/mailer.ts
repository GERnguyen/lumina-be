import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (
  email: string,
  otp: string,
  type = "Xac nhan",
): Promise<void> => {
  const sender = process.env.EMAIL_USER;

  if (!sender) {
    throw new Error("EMAIL_USER is not configured");
  }

  await transporter.sendMail({
    from: sender,
    to: email,
    subject: `[Cinx] OTP ${type}`,
    text: `Ma OTP cua ban la: ${otp}. Ma co hieu luc trong 5 phut.`,
    html: `<p>Ma OTP cua ban la: <strong>${otp}</strong></p><p>Ma co hieu luc trong 5 phut.</p>`,
  });
};
