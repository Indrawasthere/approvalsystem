import { google } from "googleapis";
import { Readable } from "stream";

class GoogleDriveService {
  private drive: any;

  constructor() {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/drive.file"],
      });

      this.drive = google.drive({ version: "v3", auth });
      console.log("Google Drive service initialized");
    } catch (error) {
      console.error("Google Drive initialization error:", error);
      throw error;
    }
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ fileId: string; webViewLink: string }> {
    try {
      console.log(`Uploading file: ${fileName} (${mimeType})`);
      console.log(`Target folder: ${process.env.GOOGLE_DRIVE_FOLDER_ID}`);

      const fileMetadata = {
        name: `${Date.now()}-${fileName}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      };

      const media = {
        mimeType,
        body: Readable.from(file),
      };

      // Check if folder is in Shared Drive
      // If using Shared Drive, need supportsAllDrives: true
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id, webViewLink",
        supportsAllDrives: true, // IMPORTANT for Shared Drive
      });

      console.log(`File uploaded: ${response.data.id}`);

      // Make publicly readable (with Shared Drive support)
      try {
        await this.drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
          supportsAllDrives: true, // IMPORTANT for Shared Drive
        });
        console.log("Permissions set to public");
      } catch (permError) {
        console.warn("Could not set public permissions:", permError);
        // Not critical, file still uploaded
      }

      const webViewLink = `https://drive.google.com/file/d/${response.data.id}/view`;

      return {
        fileId: response.data.id,
        webViewLink,
      };
    } catch (error: any) {
      console.error("Google Drive upload error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        errors: error.errors,
      });

      // Better error messages
      if (error.code === 404) {
        throw new Error(
          "Folder not found. Check GOOGLE_DRIVE_FOLDER_ID in .env"
        );
      } else if (error.code === 403) {
        throw new Error(
          "Permission denied. Service account needs access to the folder/Shared Drive"
        );
      } else if (error.code === 401) {
        throw new Error(
          "Authentication failed. Check GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY"
        );
      } else {
        throw new Error(`Google Drive error: ${error.message}`);
      }
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId,
        supportsAllDrives: true, // IMPORTANT for Shared Drive
      });
      console.log(`File deleted: ${fileId}`);
    } catch (error) {
      console.error("Google Drive delete error:", error);
    }
  }

  // Helper: Test connection and folder access
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    folderInfo?: any;
  }> {
    try {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      
      if (!folderId) {
        return {
          success: false,
          message: "GOOGLE_DRIVE_FOLDER_ID not set in .env",
        };
      }

      // Try to get folder info
      const response = await this.drive.files.get({
        fileId: folderId,
        fields: "id, name, mimeType, driveId, capabilities",
        supportsAllDrives: true,
      });

      console.log("Folder info:", response.data);

      return {
        success: true,
        message: "Connection successful",
        folderInfo: {
          id: response.data.id,
          name: response.data.name,
          isSharedDrive: !!response.data.driveId,
          driveId: response.data.driveId,
          canAddChildren: response.data.capabilities?.canAddChildren,
        },
      };
    } catch (error: any) {
      console.error("Connection test failed:", error);
      return {
        success: false,
        message: error.message || "Connection test failed",
      };
    }
  }
}

export const googleDriveService = new GoogleDriveService();