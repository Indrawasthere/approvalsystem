import { google } from "googleapis";
import { Readable } from "stream";

class GoogleDriveService {
  private drive: any;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    this.drive = google.drive({ version: "v3", auth });
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ fileId: string; webViewLink: string }> {
    try {
      const fileMetadata = {
        name: `${Date.now()}-${fileName}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      };

      const media = {
        mimeType,
        body: Readable.from(file),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id, webViewLink",
      });

      // Make publicly readable
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      return {
        fileId: response.data.id,
        webViewLink: `https://drive.google.com/file/d/${response.data.id}/view`,
      };
    } catch (error) {
      console.error("Google Drive upload error:", error);
      throw new Error("Failed to upload file to Google Drive");
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.drive.files.delete({
        fileId,
      });
    } catch (error) {
      console.error("Google Drive delete error:", error);
    }
  }
}

export const googleDriveService = new GoogleDriveService();