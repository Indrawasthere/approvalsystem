"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Upload, X, Loader, CheckCircle, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";

const approvalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  documentType: z.enum(["ICC", "QUOTATION", "PROPOSAL"]),
});

type ApprovalFormData = z.infer<typeof approvalSchema>;

export function ApprovalForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File too large (max 10MB)");
        return;
      }
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const onSubmit = async (data: ApprovalFormData) => {
    if (!file) {
      toast.error("Please upload a document");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress("Uploading to Google Drive...");

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      formData.append("documentType", data.documentType);
      formData.append("file", file);

      const response = await fetch("/api/approvals", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create approval");
      }

      setUploadProgress("Upload complete!");
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error creating approval:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create approval");
      setUploadProgress("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    setShowSuccessDialog(false);
    router.push("/dashboard/approvals");
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 mt-1"
                placeholder="Enter approval title"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-24 mt-1"
                placeholder="Describe your approval request in detail"
              />
            </div>

            <div>
              <Label htmlFor="documentType" className="text-white">Document Type *</Label>
              <Select onValueChange={(value) => setValue("documentType", value as any)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="ICC" className="text-white hover:bg-slate-600">ICC</SelectItem>
                  <SelectItem value="QUOTATION" className="text-white hover:bg-slate-600">Quotation</SelectItem>
                  <SelectItem value="PROPOSAL" className="text-white hover:bg-slate-600">Proposal</SelectItem>
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-red-400 text-sm mt-1">{errors.documentType.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Upload Document *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!file ? (
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-400 hover:text-blue-300 font-medium">
                    Click to upload
                  </span>
                  <span className="text-slate-400"> or drag and drop</span>
                </Label>
                <p className="text-xs text-slate-500 mt-2">
                  PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)
                </p>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-400 hover:text-red-300 hover:bg-slate-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            {uploadProgress && (
              <div className="flex items-center gap-2 p-3 bg-blue-500/20 rounded-lg text-blue-400">
                {uploadProgress.includes("complete") ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Loader className="w-5 h-5 animate-spin" />
                )}
                <span className="text-sm">{uploadProgress}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !file}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          >
            {isSubmitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
            {isSubmitting ? "Uploading..." : "Create Approval"}
          </Button>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              🎉 Approval Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-center">
              Your approval request has been submitted and is now pending review.
              You'll receive notifications about its progress.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-slate-300">
                Next: Your approvers will be notified automatically
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm text-slate-300">
                Document uploaded to Google Drive securely
              </span>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleContinue}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8"
            >
              View My Approvals
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}