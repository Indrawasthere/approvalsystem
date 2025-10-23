export interface EmailTemplateData {
  recipientName: string;
  recipientEmail: string;
  approval: {
    id: string;
    title: string;
    code: string;
    type: string;
    dueDate?: Date;
  };
  sender?: {
    name: string;
    email: string;
  };
  feedback?: string;
  layer?: number;
  actionUrl: string;
}

class EmailTemplates {
  private baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Wrapper HTML untuk semua email
  private wrapEmail(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #0f172a;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px;
      color: #e2e8f0;
    }
    .content h2 {
      color: #60a5fa;
      margin-top: 0;
      font-size: 20px;
    }
    .content p {
      line-height: 1.6;
      margin: 15px 0;
    }
    .info-box {
      background: #1e293b;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 8px 0;
      font-size: 14px;
    }
    .info-label {
      color: #94a3b8;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-value {
      color: #e2e8f0;
      font-weight: 600;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
      color: white !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background: #0f172a;
      padding: 20px;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    .feedback-box {
      background: #dc2626;
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p>This is an automated notification from ApprovalHub</p>
      <p>© ${new Date().getFullYear()} ApprovalHub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Template 1: New Approval Request (to Layer 1)
  approvalRequest(data: EmailTemplateData): { subject: string; html: string } {
    const content = `
      <div class="header">
        <h1>New Approval Request</h1>
      </div>
      <div class="content">
        <h2>Hi ${data.recipientName},</h2>
        <p>${data.sender?.name} has submitted a new approval request that requires your review.</p>
        
        <div class="info-box">
          <p><span class="info-label">Title</span><br><span class="info-value">${data.approval.title}</span></p>
          <p><span class="info-label">Code</span><br><span class="info-value">${data.approval.code}</span></p>
          <p><span class="info-label">Type</span><br><span class="info-value">${data.approval.type}</span></p>
          ${data.approval.dueDate ? `<p><span class="info-label">Due Date</span><br><span class="info-value">${new Date(data.approval.dueDate).toLocaleDateString()}</span></p>` : ''}
        </div>
        
        <p>Please review this approval at your earliest convenience.</p>
        
        <a href="${data.actionUrl}" class="btn">Review Approval →</a>
      </div>
    `;

    return {
      subject: `New Approval Request - ${data.approval.title}`,
      html: this.wrapEmail(content),
    };
  }

  // Template 2: Layer Ready (to next layer approver)
  layerReady(data: EmailTemplateData): { subject: string; html: string } {
    const content = `
      <div class="header">
        <h1>Approval Ready for Your Review</h1>
      </div>
      <div class="content">
        <h2>Hi ${data.recipientName},</h2>
        <p>An approval has been processed by Layer ${(data.layer || 1) - 1} and is now ready for your review (Layer ${data.layer}).</p>
        
        <div class="info-box">
          <p><span class="info-label">Title</span><br><span class="info-value">${data.approval.title}</span></p>
          <p><span class="info-label">Code</span><br><span class="info-value">${data.approval.code}</span></p>
          <p><span class="info-label">Type</span><br><span class="info-value">${data.approval.type}</span></p>
          <p><span class="info-label">Current Layer</span><br><span class="info-value">Layer ${data.layer}</span></p>
        </div>
        
        <p>Please review and provide your decision.</p>
        
        <a href="${data.actionUrl}" class="btn">Review Approval →</a>
      </div>
    `;

    return {
      subject: `Approval Ready - Layer ${data.layer} Review Required`,
      html: this.wrapEmail(content),
    };
  }

  // Template 3: Approval Completed (to requester)
  approvalCompleted(data: EmailTemplateData): { subject: string; html: string } {
    const content = `
      <div class="header">
        <h1>Approval Completed</h1>
      </div>
      <div class="content">
        <h2>Hi ${data.recipientName},</h2>
        <p>Great news! Your approval request has been fully approved by all reviewers.</p>
        
        <div class="info-box">
          <p><span class="info-label">Title</span><br><span class="info-value">${data.approval.title}</span></p>
          <p><span class="info-label">Code</span><br><span class="info-value">${data.approval.code}</span></p>
          <p><span class="info-label">Status</span><br><span class="info-value" style="color: #10b981;">✅ APPROVED</span></p>
        </div>
        
        <p>All three layers have approved your request. You can now proceed with your planned actions.</p>
        
        <a href="${data.actionUrl}" class="btn">View Details →</a>
      </div>
    `;

    return {
      subject: `Approval Completed - ${data.approval.title}`,
      html: this.wrapEmail(content),
    };
  }

  // Template 4: Needs Revision (to requester)
  needsRevision(data: EmailTemplateData): { subject: string; html: string } {
    const content = `
      <div class="header">
        <h1>Attention, Revision Needed!</h1>
      </div>
      <div class="content">
        <h2>Hi ${data.recipientName},</h2>
        <p>Layer ${data.layer} approver has requested revision on your approval request.</p>
        
        <div class="info-box">
          <p><span class="info-label">Title</span><br><span class="info-value">${data.approval.title}</span></p>
          <p><span class="info-label">Code</span><br><span class="info-value">${data.approval.code}</span></p>
        </div>
        
        ${data.feedback ? `
        <div class="feedback-box">
          <p style="color: white; margin: 0;"><strong>Feedback:</strong></p>
          <p style="color: #fecaca; margin: 10px 0 0 0;">${data.feedback}</p>
        </div>
        ` : ''}
        
        <p>Please review the feedback and resubmit your approval after making necessary changes.</p>
        
        <a href="${data.actionUrl}" class="btn">Review & Resubmit →</a>
      </div>
    `;

    return {
      subject: `Revision Needed - ${data.approval.title}`,
      html: this.wrapEmail(content),
    };
  }

  // Template 5: Approval Rejected (to requester)
  approvalRejected(data: EmailTemplateData): { subject: string; html: string } {
    const content = `
      <div class="header">
        <h1>Approval Rejected</h1>
      </div>
      <div class="content">
        <h2>Hi ${data.recipientName},</h2>
        <p>Unfortunately, your approval request has been rejected by Layer ${data.layer}.</p>
        
        <div class="info-box">
          <p><span class="info-label">Title</span><br><span class="info-value">${data.approval.title}</span></p>
          <p><span class="info-label">Code</span><br><span class="info-value">${data.approval.code}</span></p>
          <p><span class="info-label">Status</span><br><span class="info-value" style="color: #ef4444;">REJECTED</span></p>
        </div>
        
        ${data.feedback ? `
        <div class="feedback-box">
          <p style="color: white; margin: 0;"><strong>Reason for Rejection:</strong></p>
          <p style="color: #fecaca; margin: 10px 0 0 0;">${data.feedback}</p>
        </div>
        ` : ''}
        
        <p>This decision is final. You may create a new approval request if needed.</p>
        
        <a href="${data.actionUrl}" class="btn">View Details →</a>
      </div>
    `;

    return {
      subject: `Approval Rejected - ${data.approval.title}`,
      html: this.wrapEmail(content),
    };
  }
}

export const emailTemplates = new EmailTemplates();