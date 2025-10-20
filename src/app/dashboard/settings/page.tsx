import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Mail,
  Phone,
  Building
} from "lucide-react";

async function getUserSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
    },
  });
  return user;
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserSettings((session.user as any).id);
  if (!user) redirect("/dashboard");

  return (
    <main className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  defaultValue={user.name}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="department" className="text-white">Department</Label>
                <Input
                  id="department"
                  defaultValue={user.department || ""}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>



        {/* Security Settings */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-white">Change Password</Label>
                <p className="text-sm text-slate-400 mb-3">
                  Update your password to keep your account secure
                </p>
                <div className="space-y-3">
                  <Input
                    type="password"
                    placeholder="Current password"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                  <Input
                    type="password"
                    placeholder="New password"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Two-Factor Authentication</Label>
                  <p className="text-sm text-slate-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  Enable 2FA
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Update Security
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Theme</Label>
              <p className="text-sm text-slate-400 mb-3">
                Choose your preferred theme
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border border-slate-600 rounded-lg cursor-pointer bg-slate-700 hover:bg-slate-600 transition-colors">
                  <div className="text-center">
                    <div className="w-full h-8 bg-gradient-to-br from-slate-950 to-slate-900 rounded mb-2"></div>
                    <p className="text-xs text-white">Dark</p>
                  </div>
                </div>
                <div className="p-3 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                  <div className="text-center">
                    <div className="w-full h-8 bg-white rounded mb-2"></div>
                    <p className="text-xs text-slate-400">Light</p>
                  </div>
                </div>
                <div className="p-3 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                  <div className="text-center">
                    <div className="w-full h-8 bg-gradient-to-br from-blue-900 to-purple-900 rounded mb-2"></div>
                    <p className="text-xs text-slate-400">Blue</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Theme
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-gradient-to-br from-red-950 to-red-900 border-red-700">
          <CardHeader>
            <CardTitle className="text-red-100">Danger Zone</CardTitle>
            <CardDescription className="text-red-200">
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-red-100">Delete Account</Label>
                <p className="text-sm text-red-200">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
