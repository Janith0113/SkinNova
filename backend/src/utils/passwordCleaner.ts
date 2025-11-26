// .env file should have GMAIL_APP_PASSWORD with spaces like: "czsw iyye wobc xwxy"
// This file removes those spaces for authentication

export function cleanGmailPassword(password: string | undefined): string {
  if (!password) return ''
  // Remove all whitespace characters
  return password.replace(/\s/g, '')
}
