import { google } from 'googleapis';
import stream from 'stream';
import { ApiError } from '../../utils/ApiError.js';

export class GoogleDriveService {
    constructor() {
        this.drive = null;
        this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
        this.initClient();
    }

    initClient() {
        try {
            // Check for Service Account credentials in environment or service account file
            if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
                const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
                const auth = new google.auth.JWT(
                    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    null,
                    privateKey,
                    ['https://www.googleapis.com/auth/drive']
                );
                this.drive = google.drive({ version: 'v3', auth });
                console.log('[GoogleDrive] Initialized with Service Account');
            } else if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
                const oauth2Client = new google.auth.OAuth2(
                    process.env.GOOGLE_CLIENT_ID,
                    process.env.GOOGLE_CLIENT_SECRET,
                    process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
                );
                oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
                this.drive = google.drive({ version: 'v3', auth: oauth2Client });
                console.log('[GoogleDrive] Initialized with OAuth2 Refresh Token');
            } else {
                console.warn('[GoogleDrive] Credentials not configured in .env. Storage fallback will be used.');
            }
        } catch (error) {
            console.error('[GoogleDrive] Initialization error:', error.message);
        }
    }

    isAvailable() {
        return this.drive !== null;
    }

    /**
     * Uploads a file buffer to Google Drive and sets public read permissions
     */
    async uploadFile({ buffer, filename, mimeType = 'image/webp' }) {
        if (!this.drive) {
            throw new ApiError(500, 'Google Drive service is not configured. Please set Google Drive credentials.');
        }

        try {
            const bufferStream = new stream.PassThrough();
            bufferStream.end(buffer);

            const fileMetadata = {
                name: filename,
                parents: this.folderId ? [this.folderId] : []
            };

            const media = {
                mimeType,
                body: bufferStream
            };

            // 1. Upload the file
            const file = await this.drive.files.create({
                resource: fileMetadata,
                media,
                fields: 'id, name, webViewLink, webContentLink'
            });

            const fileId = file.data.id;

            // 2. Grant public read permission ("anyone with link can view")
            await this.drive.permissions.create({
                fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            });

            // 3. High-performance direct CDN URL for Google Drive hosted images
            // Google's high-speed thumbnail cache: https://lh3.googleusercontent.com/d/{fileId}=s0
            const directUrl = `https://lh3.googleusercontent.com/d/${fileId}=s0`;

            return {
                fileId,
                directUrl,
                webViewLink: file.data.webViewLink,
                webContentLink: file.data.webContentLink,
                filename: file.data.name
            };
        } catch (error) {
            console.error('[GoogleDrive] Upload error:', error);
            throw new ApiError(500, `Failed to upload to Google Drive: ${error.message}`);
        }
    }

    /**
     * Deletes a file from Google Drive by ID
     */
    async deleteFile(fileId) {
        if (!this.drive) {
            throw new ApiError(500, 'Google Drive service is not configured.');
        }

        try {
            await this.drive.files.delete({ fileId });
            console.log(`[GoogleDrive] File deleted: ${fileId}`);
            return { success: true, fileId };
        } catch (error) {
            console.error('[GoogleDrive] Delete error:', error);
            throw new ApiError(500, `Failed to delete from Google Drive: ${error.message}`);
        }
    }

    /**
     * Streams a file directly from Google Drive for server-side proxying
     */
    async getFileStream(fileId) {
        if (!this.drive) {
            throw new ApiError(500, 'Google Drive service is not configured.');
        }

        const response = await this.drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        return response.data;
    }
}

export const googleDriveService = new GoogleDriveService();
export default googleDriveService;
