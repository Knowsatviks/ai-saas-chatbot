
# MERN Stack AI Chatbot

This is an AI Chatbot application, inspired by ChatGPT, by using MERN Stack and OpenAI

It's a customized chatbot where each message of the user is stored in DB and can be retrieved and deleted.

It's a completely secure application using JWT Tokens, HTTP-Only Cookies, Signed Cookies, Password Encryption, and Middleware Chains.

Contributions are welcome

## Password reset email configuration

Password reset OTPs are sent through SMTP. Copy `.env.example` to `.env`, then replace the placeholder values:

```powershell
Copy-Item .env.example .env
```

The backend returns `503 Password reset email service is not configured` when the SMTP variables are missing.

For Gmail, use an app password with SMTP enabled rather than your regular account password.

