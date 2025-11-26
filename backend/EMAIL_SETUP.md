# Email Setup Guide for SkinNova Backend

## Overview
The backend supports two email services for sending password reset emails:
1. **Gmail** (Recommended for development)
2. **Mailtrap** (Testing without sending real emails)

---

## Option 1: Gmail Setup (Recommended)

### Steps:
1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Create an App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Copy the 16-character password provided

3. **Update .env file**
   ```
   MAIL_SERVICE="gmail"
   GMAIL_USER="your-email@gmail.com"
   GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"  (the 16-char password)
   MAIL_FROM="your-email@gmail.com"
   ```

4. **Restart backend**
   ```powershell
   npm run dev
   ```

5. **Test**
   - Go to http://localhost:3000/forgot-password
   - Enter your email
   - Check your Gmail inbox for the reset link

---

## Option 2: Mailtrap Setup (Testing Only)

### Steps:
1. **Sign up at Mailtrap**
   - Go to https://mailtrap.io
   - Create a free account
   - Create an inbox

2. **Get SMTP Credentials**
   - Click on your inbox
   - Go to "Integrations" → "Nodemailer"
   - Copy the SMTP settings

3. **Update .env file**
   ```
   MAIL_SERVICE="mailtrap"
   MAIL_HOST="smtp.mailtrap.io"
   MAIL_PORT=2525
   MAIL_USER="your-mailtrap-username"
   MAIL_PASS="your-mailtrap-password"
   MAIL_FROM="noreply@skinnova.com"
   ```

4. **Restart backend**
   ```powershell
   npm run dev
   ```

5. **Test**
   - Go to http://localhost:3000/forgot-password
   - Enter any email (doesn't need to be real)
   - Check Mailtrap inbox for the reset email

---

## Troubleshooting

### Email Not Sending?
1. Check backend console logs for error messages
2. Verify .env file is in `backend/` folder (not in root)
3. Restart backend after changing .env
4. Check that GMAIL_USER/MAIL_USER and passwords are correct

### Gmail Issues?
- Error: "Invalid login" → Check your App Password is correct
- Error: "Less secure apps" → You need an App Password (not your Gmail password)

### Mailtrap Issues?
- Check your credentials are correct
- Verify inbox is not full

---

## Production Deployment
For production:
1. Use a professional email service (SendGrid, Mailgun, AWS SES)
2. Store credentials securely (environment variables, secrets manager)
3. Configure SPF/DKIM records for better deliverability
4. Set up bounce handling and unsubscribe management

---

## File Locations
- `.env` file: `backend/.env`
- Mail service: `backend/src/services/mailService.ts`
- Auth controller: `backend/src/controllers/authController.ts`
