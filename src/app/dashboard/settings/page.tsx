"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Shield,
  Palette,
  Save,
  Trash2,
  AlertTriangle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserData {
  id: string;
  name: string;
  email: string;
  department: string | null;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    fetchUserData();
    loadTheme();
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          department: userData.department || "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  };

  const applyTheme = (newTheme: string) => {
    document.documentElement.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `Switched to ${newTheme} theme`,
    });
  };

  const handleProfileUpdate = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        fetchUserData(); // Refresh data
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password updated successfully",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted successfully",
        });
        router.push("/login");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-48"></div>
            <div className="h-64 bg-slate-800 rounded"></div>
            <div className="h-64 bg-slate-800 rounded"></div>
            <div className="h-64 bg-slate-800 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400">User not found</p>
        </div>
      </main>
    );
  }

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
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="department" className="text-white">Department</Label>
                <Input
                  id="department"
                  value={profileData.department}
                  onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleProfileUpdate}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {updating ? "Saving..." : "Save Changes"}
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
                    placeholder="New password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
              <Button
                onClick={handlePasswordChange}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {updating ? "Updating..." : "Update Security"}
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
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    theme === "dark"
                      ? "border-blue-500 bg-slate-700"
                      : "border-slate-600 bg-slate-700 hover:bg-slate-600"
                  }`}
                  onClick={() => handleThemeChange("dark")}
                >
                  <div className="text-center">
                    <div className="w-full h-8 bg-gradient-to-br from-slate-950 to-slate-900 rounded mb-2"></div>
                    <p className="text-xs text-white">Dark</p>
                  </div>
                </div>
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    theme === "light"
                      ? "border-blue-500 bg-slate-700"
                      : "border-slate-600 hover:bg-slate-700"
                  }`}
                  onClick={() => handleThemeChange("light")}
                >
                  <div className="text-center">
                    <div className="w-full h-8 bg-white rounded mb-2"></div>
                    <p className="text-xs text-slate-400">Light</p>
                  </div>
                </div>
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    theme === "blue"
                      ? "border-blue-500 bg-slate-700"
                      : "border-slate-600 hover:bg-slate-700"
                  }`}
                  onClick={() => handleThemeChange("blue")}
                >
                  <div className="text-center">
                    <div className="w-full h-8 bg-gradient-to-br from-blue-900 to-purple-900 rounded mb-2"></div>
                    <p className="text-xs text-slate-400">Blue</p>
                  </div>
                </div>
              </div>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                    disabled={deleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting ? "Deleting..." : "Delete Account"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-800 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-100 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
