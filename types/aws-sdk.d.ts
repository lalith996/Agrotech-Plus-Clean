// Minimal ambient declarations for aws-sdk used in this project
declare module 'aws-sdk' {
  // Create a namespace to allow type references like AWS.S3.PutObjectRequest
  namespace AWS {
    namespace S3 {
      interface PutObjectRequest {
        Bucket: string;
        Key: string;
        Body: any;
        ContentType?: string;
        Metadata?: Record<string, string>;
        ServerSideEncryption?: string;
      }
      interface DeleteObjectRequest {
        Bucket: string;
        Key: string;
      }
    }

    class S3 {
      constructor(options?: any);
      upload(params: S3.PutObjectRequest): { promise(): Promise<{ Location?: string; Key?: string }> };
      deleteObject(params: S3.DeleteObjectRequest): { promise(): Promise<any> };
      getSignedUrl(operation: string, params: { Bucket: string; Key: string; Expires?: number }): string;
    }
  }

  // CommonJS style export for default import compatibility
  export = AWS;
}