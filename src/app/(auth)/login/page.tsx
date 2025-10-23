import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import Link from "next/link";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-slate-900">A</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Approval Hub
              </h1>
            </div>
          <p className="text-slate-400">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-400 hover:text-cyan-400 transition-colors"
            >
              Create one
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-2">Demo Credentials:</p>
          <p>Requester: requester@approvalhub.com / requester123</p>
          <p>Level 1: approver1@approvalhub.com / approver123</p>
        </div>
      </div>
    </div>
  );
}