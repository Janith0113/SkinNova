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
    // Add timeout of 5 seconds to prevent hanging
    const verifyPromise = transporter.verify()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email verification timeout')), 5000)
    )
    await Promise.race([verifyPromise, timeoutPromise])
    console.log('Email connection verified successfully')
    return true
  } catch (err: any) {
    console.warn('Email service warning - Email connection test failed:', err.message)
    return false
  }
}

// Send appointment notification email
export async function sendAppointmentEmail(email: string, name: string, subject: string, details: string) {
  try {
    console.log(`Sending appointment email to: ${email}`)

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.GMAIL_USER || 'noreply@skinnova.com',
      to: email,
      subject: `SkinNova - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Appointment Notification</h1>
          <p style="color: #666; font-size: 16px;">Hi ${name},</p>
          <p style="color: #666; font-size: 16px;">${subject}</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
            <pre style="color: #333; font-family: Arial; white-space: pre-wrap; word-wrap: break-word; font-size: 14px;">${details}</pre>
          </div>
          
          <p style="color: #666; font-size: 16px;">Please log in to your SkinNova account to view more details.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">© 2025 SkinNova. All rights reserved.</p>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log(`Appointment email sent: ${info.messageId}`)
    return true
  } catch (err: any) {
    console.error('Error sending appointment email:', err.message)
    return false
  }
}

export default transporter

