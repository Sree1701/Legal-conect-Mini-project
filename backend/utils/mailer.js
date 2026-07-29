const nodemailer = require("nodemailer");

// Create Nodemailer Transporter using credentials from .env
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send OTP Verification Email to User
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6 digit OTP string
 */
const sendOTPEmail = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: `"LegalConnect Verification" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: "Your LegalConnect Account Verification OTP Code",
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                    <div style="background: #0B4F75; padding: 25px 20px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">⚖ LegalConnect</h1>
                        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Secure Portal Authentication</p>
                    </div>
                    <div style="padding: 30px 25px; color: #1e293b;">
                        <h2 style="margin-top: 0; color: #0B4F75; font-size: 20px;">Verification One-Time Password</h2>
                        <p style="font-size: 15px; line-height: 1.5; color: #475569;">
                            Please use the following 6-digit OTP code to complete your login verification for LegalConnect:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0B4F75; background: #eef5fb; border: 2px dashed #0B4F75; padding: 12px 28px; border-radius: 8px;">
                                ${otp}
                            </span>
                        </div>
                        <p style="font-size: 13px; color: #64748b; margin-bottom: 5px;">
                            ⏰ This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
                        </p>
                        <p style="font-size: 13px; color: #94a3b8; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                            If you did not request this OTP, please ignore this email or contact administrator support.
                        </p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Nodemailer] OTP email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[Nodemailer Error] Failed to send email to ${toEmail}:`, error.message);
        // Return false so caller knows email send failed, but log OTP so dev server works smoothly
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOTPEmail,
};
