import nodemailer from 'nodemailer'

// Configure transporter based on environment
const getTransporter = () => {
  const service = process.env.MAIL_SERVICE || 'gmail'
  
  if (service === 'gmail') {
    // Log presence of credentials (do not log secrets)
    console.log('MAIL_SERVICE=gmail')
    console.log('GMAIL_USER present:', !!process.env.GMAIL_USER)
    console.log('GMAIL_APP_PASSWORD present:', !!process.env.GMAIL_APP_PASSWORD)

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })
  } else {
    // Default to Mailtrap for testing
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.MAIL_PORT || '2525'),
      auth: {
        user: process.env.MAIL_USER || 'test',
        pass: process.env.MAIL_PASS || 'test'
      }
    })
  }
}

const transporter = getTransporter()

export async function sendPasswordResetEmail(email: string, token: string, resetUrl: string) {
  try {
    // Log for debugging
    console.log(`Attempting to send password reset email to: ${email}`)
    console.log(`Email service: ${process.env.MAIL_SERVICE || 'gmail'}`)

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.GMAIL_USER || 'noreply@skinnova.com',
      to: email,
      subject: 'SkinNova - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Password Reset Request</h1>
          <p style="color: #666; font-size: 16px;">Hi there,</p>
          <p style="color: #666; font-size: 16px;">You requested a password reset for your SkinNova account. Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}?token=${token}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">This link expires in 1 hour.</p>
          <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          <p style="color: #999; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <p style="color: #4F46E5; word-break: break-all; font-size: 12px;">${resetUrl}?token=${token}</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2025 SkinNova. All rights reserved.</p>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log(`Email sent successfully: ${info.messageId}`)
    console.log(`Response: ${info.response}`)
    return true
  } catch (err: any) {
    console.error('Error sending email:', err.message)
    console.error('Full error:', err)
    return false
  }
}

// Test function to verify email configuration
export async function testEmailConnection() {
  try {
    console.log('Testing email connection...')
    await transporter.verify()
    console.log('Email connection verified successfully')
    return true
  } catch (err: any) {
    console.error('Email connection failed:', err.message)
    return false
  }
}

export default transporter

