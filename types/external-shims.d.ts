// Ambient type shims for external modules missing from the workspace

// AWS SDK v3 (S3 client and presigner)
declare module '@aws-sdk/client-s3' {
  export class S3Client {
    constructor(config?: { region?: string; credentials?: { accessKeyId: string; secretAccessKey: string } });
    send(command: any): Promise<any>;
  }
  export class PutObjectCommand {
    constructor(params: any);
  }
  export class GetObjectCommand {
    constructor(params: any);
  }
}

declare module '@aws-sdk/s3-request-presigner' {
  export function getSignedUrl(client: any, command: any, options?: { expiresIn?: number }): Promise<string>;
}

// AWS SDK v2 (used in lib/file-upload.ts)
declare module 'aws-sdk' {
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
      interface UploadOutput {
        Location: string;
        Key: string;
      }
    }
    class S3 {
      constructor(config?: any);
      upload(params: S3.PutObjectRequest): { promise(): Promise<S3.UploadOutput> };
      deleteObject(params: S3.DeleteObjectRequest): { promise(): Promise<any> };
      getSignedUrl(operation: string, params: any): string;
    }
  }
  const AWSDefault: {
    S3: typeof AWS.S3;
  };
  export default AWSDefault;
}

// ioredis client
declare module 'ioredis' {
  export default class Redis {
    constructor(opts?: any);
    status: string;
    on(event: 'connect' | 'error' | 'close', listener: (...args: any[]) => void): void;
    get(key: string): Promise<string | null>;
    setex(key: string, ttl: number, value: string): Promise<any>;
    del(...keys: string[]): Promise<any>;
    keys(pattern: string): Promise<string[]>;
    quit(): Promise<void>;
  }
}

// node-cache
declare module 'node-cache' {
  export default class NodeCache {
    constructor(opts?: any);
    set<T>(key: string, value: T, ttl?: number): boolean;
    get<T>(key: string): T | undefined;
    del(keys: string | string[]): number;
    keys(): string[];
    flushAll(): void;
    getStats(): any;
    close(): void;
  }
}

// SendGrid Mail
declare module '@sendgrid/mail' {
  type MailDataRequired = {
    to: string | string[];
    from: string;
    subject: string;
    html?: string;
    text?: string;
  };
  const sgMail: {
    setApiKey(key: string): void;
    send(data: MailDataRequired): Promise<any>;
  };
  export default sgMail;
}

// Twilio SDK
declare module 'twilio' {
  type MessageCreateParams = { body: string; from: string; to: string };
  interface TwilioClient {
    messages: { create(params: MessageCreateParams): Promise<any> };
  }
  function twilio(accountSid: string, authToken: string): TwilioClient;
  export default twilio;
}

// Firebase Web SDK
declare module 'firebase/app' {
  export type FirebaseApp = any;
  export function initializeApp(config: Record<string, any>): FirebaseApp;
}

declare module 'firebase/analytics' {
  import type { FirebaseApp } from 'firebase/app';
  export function getAnalytics(app: FirebaseApp): any;
}

// Radix UI modules used in the project
// Popover
declare module '@radix-ui/react-popover' {
  const Root: any;
  const Trigger: any;
  const Content: any;
  const Portal: any;
  export { Root as Popover, Trigger as PopoverTrigger, Content as PopoverContent };
  export default Root;
}
// Switch
declare module '@radix-ui/react-switch' {
  const Root: any;
  const Thumb: any;
  export { Root as Switch };
  export default Root;
}
// Accordion
declare module '@radix-ui/react-accordion' {
  const Root: any;
  const Item: any;
  const Trigger: any;
  const Content: any;
  const Header: any;
  export { Root as Accordion, Item as AccordionItem, Trigger as AccordionTrigger, Content as AccordionContent };
  export default Root;
}

// Multer minimal ambient types
declare module 'multer' {
  const multer: any;
  export default multer;
}

// Express namespace for Multer file type
declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
      destination?: string;
      filename?: string;
      path?: string;
    }
  }
}

// Stripe server SDK minimal ambient types
declare module 'stripe' {
  export default class Stripe {
    constructor(apiKey: string, config?: { apiVersion?: string });
    paymentIntents: {
      create(params: { amount: number; currency: string }): Promise<{ client_secret: string | null }>;
    };
  }
}

// Google Maps React API minimal ambient types
declare module '@react-google-maps/api' {
  export const GoogleMap: any;
  export const Marker: any;
  export function useJsApiLoader(opts: { id?: string; googleMapsApiKey?: string }): { isLoaded: boolean };
}