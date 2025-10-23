import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { emailService } from "@/services/email";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json({ error: "Email recipient required" }, { status: 400 });
    }

    console.log(`🧪 Testing email to: ${to}`);

    // Verify connection first
    const isConnected = await emailService.verifyConnection();
    if (!isConnected) {
      return NextResponse.json(
        { 
          error: "Email service connection failed",
          message: "Check EMAIL_USER and EMAIL_PASSWORD in .env"
        },
        { status: 500 }
      );
    }

    // Send test email
    const success = await emailService.sendTestEmail(to);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${to}`,
      });
    } else {
      return NextResponse.json(
        { 
          error: "Failed to send email",
          message: "Check server logs for details"
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Test email API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint to verify email config
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    const isConnected = hasConfig ? await emailService.verifyConnection() : false;

    return NextResponse.json({
      configured: hasConfig,
      connected: isConnected,
      emailUser: process.env.EMAIL_USER || "Not configured",
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || "587",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}