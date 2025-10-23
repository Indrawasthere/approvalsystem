import nodemailer from "nodemailer";
import { emailTemplates, EmailTemplateData } from "./email-templates";

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check if email config exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn("⚠️ Email configuration missing. Emails will be logged only.");
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true", // true for 465, false for 587
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      console.log("✅ Email transporter initialized");
    } catch (error) {
      console.error("❌ Email transporter initialization failed:", error);
      this.transporter = null;
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // Log email for development
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 SENDING EMAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${to}
Subject: ${subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    // If no transporter (config missing), just log
    if (!this.transporter) {
      console.log("⚠️ Email not sent (transporter not configured)");
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || `"ApprovalHub" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log("✅ Email sent successfully:", info.messageId);
      return true;
    } catch (error: any) {
      console.error("❌ Email sending failed:", error);
      
      // Log specific errors
      if (error.code === "EAUTH") {
        console.error("Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD");
      } else if (error.code === "ESOCKET") {
        console.error("Network error. Check internet connection");
      } else if (error.responseCode === 550) {
        console.error("Recipient email rejected");
      }

      return false;
    }
  }

  async sendApprovalRequest(data: EmailTemplateData): Promise<boolean> {
    const { subject, html } = emailTemplates.approvalRequest(data);
    return await this.sendEmail(data.recipientEmail, subject, html);
  }

  async sendLayerReady(data: EmailTemplateData): Promise<boolean> {
    const { subject, html } = emailTemplates.layerReady(data);
    return await this.sendEmail(data.recipientEmail, subject, html);
  }

  async sendApprovalCompleted(data: EmailTemplateData): Promise<boolean> {
    const { subject, html } = emailTemplates.approvalCompleted(data);
    return await this.sendEmail(data.recipientEmail, subject, html);
  }

  async sendNeedsRevision(data: EmailTemplateData): Promise<boolean> {
    const { subject, html } = emailTemplates.needsRevision(data);
    return await this.sendEmail(data.recipientEmail, subject, html);
  }

  async sendApprovalRejected(data: EmailTemplateData): Promise<boolean> {
    const { subject, html } = emailTemplates.approvalRejected(data);
    return await this.sendEmail(data.recipientEmail, subject, html);
  }

  // Test email function
  async sendTestEmail(to: string): Promise<boolean> {
    const subject = "🧪 ApprovalHub Email Test";
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0f172a;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }
    h1 {
      color: #60a5fa;
      margin: 0 0 20px 0;
    }
    p {
      color: #e2e8f0;
      line-height: 1.6;
    }
    .success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      font-weight: bold;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎉 Email Configuration Successful!</h1>
    <div class="success">
      ✅ Email service is working properly
    </div>
    <p>This is a test email from ApprovalHub to verify that email notifications are working correctly.</p>
    <p><strong>Sent to:</strong> ${to}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    <p style="margin-top: 30px; color: #94a3b8; font-size: 12px;">
      If you received this email, your ApprovalHub notification system is ready to use! 🚀
    </p>
  </div>
</body>
</html>
    `;

    return await this.sendEmail(to, subject, html);
  }

  // Verify transporter connection
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.log("⚠️ Email transporter not configured");
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("✅ Email server connection verified");
      return true;
    } catch (error) {
      console.error("❌ Email server connection failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();