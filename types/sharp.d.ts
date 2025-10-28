// Minimal ambient declaration for the sharp module used in server-side image processing

declare module 'sharp' {
  type SharpInstance = {
    grayscale(): SharpInstance;
    normalize(): SharpInstance;
    sharpen(): SharpInstance;
    resize(width?: number | null, height?: number | null, options?: { fit?: string; position?: string; withoutEnlargement?: boolean }): SharpInstance;
    png(options?: any): SharpInstance;
    jpeg(options?: any): SharpInstance;
    webp(options?: any): SharpInstance;
    toBuffer(): Promise<Buffer>;
    metadata(): Promise<any>;
    composite(args: Array<{ input: Buffer | string; gravity?: string }>): SharpInstance;
  };
  function sharp(input?: Buffer | string): SharpInstance;
  export = sharp;
}