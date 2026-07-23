import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import crypto from 'crypto';
import path from 'path';

export class AzureBlobProvider {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || 'UseDevelopmentStorage=true';
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'product-images';

    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = this.blobServiceClient.getContainerClient(containerName);
  }

  /**
   * Initializes the container if it doesn't exist.
   */
  async initialize() {
    try {
      await this.containerClient.createIfNotExists({
        access: 'blob' // Make blobs publicly readable
      });
      console.log(`✅ Azure Blob Container '${this.containerClient.containerName}' ready.`);
    } catch (error) {
      console.error('❌ Failed to initialize Azure Blob Container:', error);
    }
  }

  /**
   * Uploads a buffer to Azure Blob Storage and returns the public URL.
   */
  async uploadImage(buffer: Buffer, originalname: string, mimetype: string): Promise<string> {
    const extension = path.extname(originalname);
    const blobName = `${crypto.randomUUID()}${extension}`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimetype }
    });

    return blockBlobClient.url;
  }
}

export const azureBlobProvider = new AzureBlobProvider();
