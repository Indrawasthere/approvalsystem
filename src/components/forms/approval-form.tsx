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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";

const approvalSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  category: z.string().min(1, "Category is required"),
  amount: z.string().optional(),
  firstLayerApproverId: z.string().min(1, "First layer approver is required"),
  secondLayerApproverId: z.string().optional(),
  thirdLayerApproverId: z.string().optional(),
});

type ApprovalFormData = z.infer<typeof approvalSchema>;

interface ApprovalFormProps {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  }>;
}

export function ApprovalForm({ users }: ApprovalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      priority: "MEDIUM",
      category: "",
    },
  });

  const watchedPriority = watch("priority");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ApprovalFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      // Add attachments
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      const response = await fetch("/api/approvals", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create approval");
      }

      toast.success("Approval request created successfully!");
      router.push("/dashboard/approvals");
    } catch (error) {
      console.error("Error creating approval:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create approval");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter users by role for approvers
  const approvers = users.filter(user => user.role !== "REQUESTER");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Basic Information</CardTitle>
          <CardDescription>Provide the basic details for your approval request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              placeholder="Enter approval title"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-24"
              placeholder="Describe your approval request in detail"
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority" className="text-white">Priority *</Label>
              <Select onValueChange={(value) => setValue("priority", value as any)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="LOW" className="text-white hover:bg-slate-600">Low</SelectItem>
                  <SelectItem value="MEDIUM" className="text-white hover:bg-slate-600">Medium</SelectItem>
                  <SelectItem value="HIGH" className="text-white hover:bg-slate-600">High</SelectItem>
                  <SelectItem value="URGENT" className="text-white hover:bg-slate-600">Urgent</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-red-400 text-sm mt-1">{errors.priority.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category" className="text-white">Category *</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="ICC" className="text-white hover:bg-slate-600">ICC</SelectItem>
                  <SelectItem value="QUOTATION" className="text-white hover:bg-slate-600">Quotation</SelectItem>
                  <SelectItem value="PROPOSAL" className="text-white hover:bg-slate-600">Proposal</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
            )}
            </div>
          </div>


        </CardContent>
      </Card>

      {/* Approval Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Approval Workflow</CardTitle>
          <CardDescription>Select the approvers for your request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="firstLayerApproverId" className="text-white">First Layer Approver *</Label>
            <Select onValueChange={(value) => setValue("firstLayerApproverId", value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select first approver" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {approvers.map((user) => (
                  <SelectItem key={user.id} value={user.id} className="text-white hover:bg-slate-600">
                    {user.name} - {user.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.firstLayerApproverId && (
              <p className="text-red-400 text-sm mt-1">{errors.firstLayerApproverId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="secondLayerApproverId" className="text-white">Second Layer Approver (Optional)</Label>
            <Select onValueChange={(value) => setValue("secondLayerApproverId", value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select second approver" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {approvers.map((user) => (
                  <SelectItem key={user.id} value={user.id} className="text-white hover:bg-slate-600">
                    {user.name} - {user.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="thirdLayerApproverId" className="text-white">Third Layer Approver (Optional)</Label>
            <Select onValueChange={(value) => setValue("thirdLayerApproverId", value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select third approver" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {approvers.map((user) => (
                  <SelectItem key={user.id} value={user.id} className="text-white hover:bg-slate-600">
                    {user.name} - {user.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Attachments</CardTitle>
          <CardDescription>Upload any relevant documents or files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="attachments" className="text-white">Upload Files</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md hover:border-slate-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-400">
                  <label
                    htmlFor="attachments"
                    className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300"
                  >
                    <span>Upload files</span>
                    <input
                      id="attachments"
                      name="attachments"
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">
                  PDF, DOC, XLS, TXT, JPG, PNG up to 10MB each
                </p>
              </div>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white">Attached Files</Label>
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded-md">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-sm text-white">{file.name}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
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
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
        >
          {isSubmitting ? "Creating..." : "Create Approval"}
        </Button>
      </div>
    </form>
  );
}
