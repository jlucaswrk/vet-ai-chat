import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const SPACES_REGION = process.env.DO_SPACES_REGION || 'nyc3';
const SPACES_BUCKET = process.env.DO_SPACES_BUCKET || 'vet-ai-files';
const SPACES_ENDPOINT = `https://${SPACES_REGION}.digitaloceanspaces.com`;

// Initialize S3 client for DigitalOcean Spaces
export const spacesClient = new S3Client({
  endpoint: SPACES_ENDPOINT,
  region: SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
  },
  forcePathStyle: false,
});

// Generate a presigned URL for uploading
export async function getUploadUrl(filename: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }> {
  const fileKey = `uploads/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: SPACES_BUCKET,
    Key: fileKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(spacesClient, command, { expiresIn: 3600 }); // 1 hour

  return { uploadUrl, fileKey };
}

// Generate a presigned URL for downloading
export async function getDownloadUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: SPACES_BUCKET,
    Key: fileKey,
  });

  return getSignedUrl(spacesClient, command, { expiresIn: 3600 });
}

// Get file from Spaces as buffer
export async function getFileBuffer(fileKey: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: SPACES_BUCKET,
    Key: fileKey,
  });

  const response = await spacesClient.send(command);

  if (!response.Body) {
    throw new Error('Empty response from Spaces');
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  const reader = response.Body.transformToWebStream().getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

// Delete file from Spaces
export async function deleteFile(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: SPACES_BUCKET,
    Key: fileKey,
  });

  await spacesClient.send(command);
}

// Get the CDN URL for a file
export function getCdnUrl(fileKey: string): string {
  return `https://${SPACES_BUCKET}.${SPACES_REGION}.cdn.digitaloceanspaces.com/${fileKey}`;
}
