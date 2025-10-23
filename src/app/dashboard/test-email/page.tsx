"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, XCircle, Loader, Send, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TestEmailPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState("mhmdfdln14@gmail.com");

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/test-email");
      const data = await res.json();
      setConfig(data);
    } catch (error) {
      console.error("Failed to fetch config:", error);
      toast({
        title: "Error",
        description: "Failed to load email configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Success",
          description: `Test email sent to ${testEmail}! Check your inbox.`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Send test email error:", error);
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">📧 Email Service Test</h1>
        <p className="text-slate-400">
          Test your email configuration and send test emails
        </p>
      </div>

      {/* Configuration Status */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400 text-sm">Status</Label>
              <div className="mt-1">
                {config?.configured && config?.connected ? (
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : config?.configured ? (
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    <XCircle className="w-3 h-3 mr-1" />
                    Configured but not connected
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400">
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Configured
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <Label className="text-slate-400 text-sm">Email User</Label>
              <p className="text-white mt-1 font-mono text-sm">
                {config?.emailUser || "Not set"}
              </p>
            </div>

            <div>
              <Label className="text-slate-400 text-sm">SMTP Host</Label>
              <p className="text-white mt-1 font-mono text-sm">
                {config?.host || "smtp.gmail.com"}
              </p>
            </div>

            <div>
              <Label className="text-slate-400 text-sm">SMTP Port</Label>
              <p className="text-white mt-1 font-mono text-sm">
                {config?.port || "587"}
              </p>
            </div>
          </div>

          {!config?.configured && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">
                ⚠️ Email service not configured. Add the following to your .env file:
              </p>
              <pre className="mt-2 text-xs text-red-300 bg-red-950/50 p-3 rounded overflow-x-auto">
{`EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="ApprovalHub" <your-email@gmail.com>`}
              </pre>
            </div>
          )}

          {config?.configured && !config?.connected && (
            <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-400 text-sm">
                ⚠️ Unable to connect to email server. Check your credentials and network connection.
              </p>
            </div>
          )}

          <Button
            onClick={fetchConfig}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Refresh Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Send Test Email */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Send a test email to verify your configuration is working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testEmail" className="text-white">
              Recipient Email
            </Label>
            <Input
              id="testEmail"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter email address"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 mt-1"
            />
            <p className="text-xs text-slate-400 mt-1">
              This will send a test email to verify your email service is working
            </p>
          </div>

          <Button
            onClick={sendTestEmail}
            disabled={sending || !config?.configured || !config?.connected}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white w-full"
          >
            {sending ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Test Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Test Emails */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Test</CardTitle>
          <CardDescription>
            Send test emails to your configured addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { email: "mhmdfdln14@gmail.com", label: "Requester" },
              { email: "aquaswing4@gmail.com", label: "Approver 1" },
              { email: "vc.ag@atreusg.com", label: "Approver 2" },
              { email: "muhammad.hafiz@atreusg.com", label: "Approver 3" },
            ].map((item) => (
              <Button
                key={item.email}
                onClick={() => {
                  setTestEmail(item.email);
                  setTimeout(() => sendTestEmail(), 100);
                }}
                disabled={sending || !config?.configured || !config?.connected}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 justify-start"
              >
                <Mail className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.email}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-700">
        <CardHeader>
          <CardTitle className="text-blue-300">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-200 space-y-2">
          <p><strong>1. Enable 2FA on Gmail:</strong></p>
          <p className="text-xs text-blue-300 ml-4">
            Go to Google Account → Security → 2-Step Verification
          </p>
          
          <p><strong>2. Generate App Password:</strong></p>
          <p className="text-xs text-blue-300 ml-4">
            Security → 2-Step Verification → App passwords → Select "Mail" → Generate
          </p>
          
          <p><strong>3. Add to .env file:</strong></p>
          <pre className="text-xs bg-blue-950/50 p-3 rounded overflow-x-auto text-blue-200 ml-4">
{`EMAIL_USER=mhmdfdln14@gmail.com
EMAIL_PASSWORD=<16-char-app-password>`}
          </pre>
          
          <p><strong>4. Restart server:</strong></p>
          <p className="text-xs text-blue-300 ml-4">
            Stop and restart your dev server (npm run dev)
          </p>
        </CardContent>
      </Card>
    </main>
  );
}