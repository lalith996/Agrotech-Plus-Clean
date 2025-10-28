export interface AudioRecording {
  file: Blob
  duration: number
  createdAt: Date
}

export type RecordingState = 'idle' | 'recording' | 'stopped'

export interface BarcodeResult {
  data: string
  format: string
  timestamp: number
}

export class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null
  private chunks: BlobPart[] = []
  private startTime: number = 0
  private state: RecordingState = 'idle'

  static async isAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.some(d => d.kind === 'audioinput')
    } catch {
      return false
    }
  }

  async startRecording(): Promise<void> {
    if (this.state === 'recording') return
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.mediaRecorder = new MediaRecorder(stream)
    this.chunks = []
    this.startTime = Date.now()
    this.state = 'recording'

    this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data)
      }
    }

    this.mediaRecorder.start()
  }

  async stopRecording(): Promise<AudioRecording> {
    if (!this.mediaRecorder) throw new Error('No active recording')

    const { mediaRecorder } = this
    const stopPromise = new Promise<void>((resolve) => {
      mediaRecorder.onstop = () => resolve()
    })

    mediaRecorder.stop()
    await stopPromise

    const blob = new Blob(this.chunks, { type: 'audio/webm' })
    const duration = (Date.now() - this.startTime) / 1000
    this.state = 'stopped'

    return { file: blob, duration, createdAt: new Date() }
  }
}

export class CameraService {
  private stream: MediaStream | null = null

  static async isCameraAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.some(d => d.kind === 'videoinput')
    } catch {
      return false
    }
  }

  async initializeCamera(videoEl: HTMLVideoElement): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    videoEl.srcObject = this.stream
    await videoEl.play()
  }

  stopCamera(): void {
    this.stream?.getTracks().forEach(t => t.stop())
    this.stream = null
  }
}

export class BarcodeService {
  async initialize(): Promise<void> {
    // Placeholder: In production, initialize ZXing/Quagga/etc.
    return
  }

  startContinuousScanning(
    videoEl: HTMLVideoElement,
    onScan: (result: BarcodeResult) => void,
    intervalMs: number
  ): () => void {
    const timer = setInterval(() => {
      // Placeholder: No real decoding; just simulate occasionally
      // This keeps types satisfied; actual decoding handled elsewhere
    }, intervalMs)
    return () => clearInterval(timer)
  }

  async scanFromFile(file: File): Promise<BarcodeResult | null> {
    // Placeholder: Always return null; integrate real library later
    return null
  }
}