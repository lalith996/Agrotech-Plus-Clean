// Enhanced ambient declarations for tesseract.js to match project usage

declare module 'tesseract.js' {
  export interface RecognizeResult {
    data: {
      text: string;
      confidence: number;
      words: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }>;
      lines: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }>;
      paragraphs: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }>;
    };
  }

  export interface Worker {
    recognize(image: any): Promise<RecognizeResult>;
    setParameters(params: Record<string, any>): Promise<void>;
    terminate(): Promise<void>;
    load?: () => Promise<void>;
    loadLanguage?: (lang: string) => Promise<void>;
    initialize?: (lang: string) => Promise<void>;
  }

  export const PSM: { AUTO: number };
  export function createWorker(lang?: string, options?: any, config?: { logger?: (m: any) => void }): Promise<Worker>;

  const TesseractDefault: {
    Worker: Worker;
    PSM: typeof PSM;
    createWorker: typeof createWorker;
  };

  export default TesseractDefault;
}