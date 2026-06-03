import { useState } from '#app';
import { 
  S3Client, 
  ListBucketsCommand, 
  CreateBucketCommand, 
  DeleteBucketCommand, 
  ListObjectsV2Command, 
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { FetchHttpHandler } from "@smithy/fetch-http-handler";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const useS3 = () => {
  // S3 connection settings
  const s3Config = useState('s3-config', () => ({
    endpoint: 'http://127.0.0.1:9000',
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
  }));

  const isConnected = useState('s3-connected', () => false);
  const bucketsList = useState('s3-buckets', () => []);

  // Helper to load config from localStorage
  const initializeConfig = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('s3_console_config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          s3Config.value = { ...s3Config.value, ...parsed };
        } catch (e) {
          console.error("Failed to parse saved S3 config:", e);
        }
      }
    }
  };

  // S3 Client Factory with 1000IQ Proxy requestHandler
  const createS3Client = () => {
    return new S3Client({
      endpoint: s3Config.value.endpoint, // Sign request using direct target host and path
      requestHandler: {
        handle: async (request: any, options: any) => {
          if (typeof window !== 'undefined') {
            // Intercept signed request and redirect it to Nuxt S3 Proxy
            request.hostname = window.location.hostname;
            request.port = window.location.port ? parseInt(window.location.port) : undefined;
            request.protocol = window.location.protocol;
            
            // Prepend proxy prefix so Nuxt routeRules can handle it
            request.path = '/api/s3' + request.path;
          }
          
          const defaultHandler = new FetchHttpHandler();
          return defaultHandler.handle(request, options);
        }
      },
      credentials: {
        accessKeyId: s3Config.value.accessKeyId,
        secretAccessKey: s3Config.value.secretAccessKey
      },
      region: s3Config.value.region,
      forcePathStyle: true
    });
  };

  // Connection Testing
  const checkConnection = async () => {
    initializeConfig();
    if (!s3Config.value.accessKeyId || !s3Config.value.secretAccessKey) {
      isConnected.value = false;
      bucketsList.value = [];
      return false;
    }
    try {
      const client = createS3Client();
      const command = new ListBucketsCommand({});
      const response = await client.send(command);
      
      isConnected.value = true;
      bucketsList.value = response.Buckets || [];
      return true;
    } catch (error) {
      console.error("S3 Connection failed:", error);
      isConnected.value = false;
      bucketsList.value = [];
      return false;
    }
  };

  // Login
  const login = async (config: { username: string; password: string }) => {
    if (config.username === 'Admin' && config.password === 'Laskar57') {
      const s3Credentials = {
        endpoint: 'http://127.0.0.1:9000',
        accessKeyId: 'rustfsadmin',
        secretAccessKey: 'rustfsadmin',
        region: 'us-east-1'
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('s3_console_config', JSON.stringify(s3Credentials));
      }
      s3Config.value = s3Credentials;
      return await checkConnection();
    }
    return false;
  };

  // Logout
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('s3_console_config');
    }
    s3Config.value = {
      endpoint: 'http://127.0.0.1:9000',
      accessKeyId: '',
      secretAccessKey: '',
      region: 'us-east-1'
    };
    isConnected.value = false;
    bucketsList.value = [];
  };

  // Create Bucket
  const createBucket = async (bucketName: string) => {
    const name = bucketName.trim().toLowerCase();
    if (!name) throw new Error("Bucket name cannot be empty!");

    const client = createS3Client();
    const command = new CreateBucketCommand({ Bucket: name });
    await client.send(command);
    await checkConnection();
  };

  // Delete Bucket
  const deleteBucket = async (bucketName: string) => {
    const client = createS3Client();
    const command = new DeleteBucketCommand({ Bucket: bucketName });
    await client.send(command);
    await checkConnection();
  };

  // Load objects in a specific bucket with prefix and delimiter support
  const loadObjectsList = async (bucketName: string, prefix = '', delimiter = '') => {
    const client = createS3Client();
    const params: any = { Bucket: bucketName };
    if (prefix) params.Prefix = prefix;
    if (delimiter) params.Delimiter = delimiter;

    const command = new ListObjectsV2Command(params);
    const response = await client.send(command);
    return {
      contents: response.Contents || [],
      commonPrefixes: response.CommonPrefixes || []
    };
  };

  // Generate Presigned S3 link
  const generatePresignedUrl = async (bucketName: string, key: string) => {
    const client = createS3Client();
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    return await getSignedUrl(client, command, { expiresIn: 3600 });
  };

  // Delete object from S3
  const deleteObject = async (bucketName: string, key: string) => {
    const client = createS3Client();
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    await client.send(command);
  };

  // Upload Object to S3
  const uploadObject = async (bucketName: string, key: string, file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const client = createS3Client();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: new Uint8Array(arrayBuffer)
    });
    await client.send(command);
  };

  // Create Folder inside S3 Bucket
  const createFolder = async (bucketName: string, folderKey: string) => {
    let key = folderKey.trim();
    if (!key) throw new Error("Folder name cannot be empty!");
    if (!key.endsWith('/')) {
      key += '/';
    }
    const client = createS3Client();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: ''
    });
    await client.send(command);
  };

  // Get Object Blob from S3
  const getObjectBlob = async (bucketName: string, key: string) => {
    const client = createS3Client();
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    const response = await client.send(command);
    if (!response.Body) throw new Error("Empty response body from S3");

    if (typeof (response.Body as any).transformToBlob === 'function') {
      return await (response.Body as any).transformToBlob();
    } else if (typeof (response.Body as any).transformToByteArray === 'function') {
      const bytes = await (response.Body as any).transformToByteArray();
      return new Blob([bytes]);
    }
    throw new Error("S3 object body conversion not supported in this environment");
  };

  return {
    s3Config,
    isConnected,
    bucketsList,
    createS3Client,
    checkConnection,
    login,
    logout,
    createBucket,
    deleteBucket,
    loadObjectsList,
    generatePresignedUrl,
    deleteObject,
    uploadObject,
    createFolder,
    getObjectBlob
  };
};
