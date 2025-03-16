import { transporter } from "../hooks/useTransporter";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP Server bağlantı hatası:", error);
  } else {
    console.log("SMTP Server bağlantısı başarılı!");
  }
});

export const sendVerificationEmail = async (
  email: string,
  token: string,
  username: string
): Promise<void> => {
  const verificationUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"LocaRater" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "LocaRater - Email Adresinizi Doğrulayın",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Merhaba ${username},</h2>
        <p>LocaRater'a hoş geldiniz! Hesabınızı aktifleştirmek için lütfen email adresinizi doğrulayın.</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Email Adresimi Doğrula</a>
        </div>
        <p>Veya aşağıdaki bağlantıyı tarayıcınıza kopyalayabilirsiniz:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Bu bağlantı 24 saat boyunca geçerlidir.</p>
        <p>Eğer bu hesabı siz oluşturmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
        <p>Teşekkürler,<br>LocaRater Ekibi</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Email gönderilemedi");
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  username: string
): Promise<void> => {
  const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: `"LocaRater" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "LocaRater - Şifre Sıfırlama",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Merhaba ${username},</h2>
        <p>LocaRater hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Şifremi Sıfırla</a>
        </div>
        <p>Veya aşağıdaki bağlantıyı tarayıcınıza kopyalayabilirsiniz:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Bu bağlantı 1 saat boyunca geçerlidir.</p>
        <p>Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
        <p>Teşekkürler,<br>LocaRater Ekibi</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Email gönderilemedi");
  }
};
