import { emailTemplates, EmailTemplateData } from "./email-templates";

class EmailService {
  // Mock implementation for Phase 2
  async sendEmail(to: string, subject: string, html: string) {
    // Mock - just log to console
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL SENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${to}
Subject: ${subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${html}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    // Phase 3: Implement real email sending
    // Example with Nodemailer:
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"ApprovalHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    */
  }

  async sendApprovalRequest(data: EmailTemplateData) {
    const { subject, html } = emailTemplates.approvalRequest(data);
    await this.sendEmail(data.recipientEmail, subject, html);
  }

  async sendLayerReady(data: EmailTemplateData) {
    const { subject, html } = emailTemplates.layerReady(data);
    await this.sendEmail(data.recipientEmail, subject, html);
  }

  async sendApprovalCompleted(data: EmailTemplateData) {
    const { subject, html } = emailTemplates.approvalCompleted(data);
    await this.sendEmail(data.recipientEmail, subject, html);
  }

  async sendNeedsRevision(data: EmailTemplateData) {
    const { subject, html } = emailTemplates.needsRevision(data);
    await this.sendEmail(data.recipientEmail, subject, html);
  }

  async sendApprovalRejected(data: EmailTemplateData) {
    const { subject, html } = emailTemplates.approvalRejected(data);
    await this.sendEmail(data.recipientEmail, subject, html);
  }
}

export const emailService = new EmailService();