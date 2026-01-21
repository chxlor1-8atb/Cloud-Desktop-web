import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
})

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
        from: {
            name: 'Cloud Desktop',
            address: process.env.GMAIL_USER!,
        },
        to: email,
        subject: '🔐 Your Cloud Desktop Login Code',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f23;">
          <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(145deg, #1a1a2e 0%, #16162a 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
              <!-- Logo -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 28px; background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                  ☁️ Cloud Desktop
                </h1>
              </div>
              
              <!-- Content -->
              <div style="text-align: center;">
                <p style="color: #94a3b8; font-size: 16px; margin-bottom: 25px;">
                  Your verification code is:
                </p>
                
                <!-- OTP Box -->
                <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%); border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                  <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff;">
                    ${otp}
                  </span>
                </div>
                
                <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
                  This code will expire in <strong style="color: #f59e0b;">5 minutes</strong>
                </p>
                
                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 20px;">
                  <p style="color: #64748b; font-size: 12px; margin: 0;">
                    If you didn't request this code, you can safely ignore this email.
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #475569; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Cloud Desktop. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    }

    await transporter.sendMail(mailOptions)
}
