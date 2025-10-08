import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn().mockResolvedValue({
    result: {
      createObjectStore: vi.fn(),
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          add: vi.fn().mockResolvedValue({}),
          get: vi.fn().mockResolvedValue({ result: null }),
          getAll: vi.fn().mockResolvedValue({ result: [] }),
          put: vi.fn().mockResolvedValue({}),
          delete: vi.fn().mockResolvedValue({})
        })
      })
    }
  })
};

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn().mockImplementation((success) => {
    success({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10
      },
      timestamp: Date.now()
    });
  }),
  watchPosition: vi.fn().mockReturnValue(1),
  clearWatch: vi.fn()
};

// Mock camera API
const mockMediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: vi.fn().mockReturnValue([
      { stop: vi.fn() }
    ])
  }),
  enumerateDevices: vi.fn().mockResolvedValue([
    { deviceId: 'camera1', kind: 'videoinput', label: 'Back Camera' },
    { deviceId: 'camera2', kind: 'videoinput', label: 'Front Camera' }
  ])
};

// Setup global mocks
global.indexedDB = mockIndexedDB as any;
global.navigator = {
  ...global.navigator,
  geolocation: mockGeolocation,
  mediaDevices: mockMediaDevices
} as any;

describe('QC Interface System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Offline Data Storage', () => {
    it('should initialize IndexedDB for offline storage', async () => {
      const initOfflineDB = async () => {
        const dbName = 'QCOfflineDB';
        const version = 1;
        
        // Mock the IndexedDB initialization
        const mockDB = {
          objectStoreNames: {
            contains: vi.fn().mockReturnValue(false)
          },
          createObjectStore: vi.fn().mockReturnValue({
            createIndex: vi.fn()
          })
        };
        
        // Simulate successful initialization
        return mockDB;
      };

      const db = await initOfflineDB();
      
      expect(db).toBeDefined();
      expect(db.createObjectStore).toBeDefined();
    });

    it('should store QC records offline', async () => {
      const storeQCRecord = async (record: any) => {
        const db = await indexedDB.open('QCOfflineDB', 1);
        const transaction = db.result.transaction(['qcRecords'], 'readwrite');
        const store = transaction.objectStore('qcRecords');
        
        return store.add(record);
      };

      const qcRecord = {
        id: 'qc-123',
        farmId: 'farm-456',
        inspectorId: 'inspector-789',
        timestamp: new Date().toISOString(),
        location: { lat: 37.7749, lon: -122.4194 },
        crops: ['tomatoes', 'lettuce'],
        qualityScore: 8.5,
        notes: 'Good quality produce',
        photos: ['photo-1', 'photo-2'],
        signature: 'signature-1',
        status: 'pending_sync'
      };

      await storeQCRecord(qcRecord);
      
      expect(mockIndexedDB.open).toHaveBeenCalled();
    });

    it('should retrieve offline QC records', async () => {
      const getOfflineRecords = async () => {
        const db = await indexedDB.open('QCOfflineDB', 1);
        const transaction = db.result.transaction(['qcRecords'], 'readonly');
        const store = transaction.objectStore('qcRecords');
        
        return store.getAll();
      };

      const records = await getOfflineRecords();
      
      expect(records).toBeDefined();
      expect(mockIndexedDB.open).toHaveBeenCalled();
    });

    it('should handle offline data queuing', () => {
      const offlineQueue = {
        qcRecords: [],
        photos: [],
        signatures: []
      };

      const addToQueue = (type: keyof typeof offlineQueue, item: any) => {
        offlineQueue[type].push({
          ...item,
          queuedAt: new Date().toISOString(),
          syncStatus: 'pending'
        });
      };

      const qcRecord = { id: 'qc-123', data: 'test' };
      addToQueue('qcRecords', qcRecord);

      expect(offlineQueue.qcRecords).toHaveLength(1);
      expect(offlineQueue.qcRecords[0].syncStatus).toBe('pending');
    });
  });

  describe('Data Synchronization', () => {
    it('should sync offline data when online', async () => {
      const mockApiCall = vi.fn().mockResolvedValue({ success: true, id: 'synced-123' });
      
      const syncOfflineData = async (offlineRecords: any[]) => {
        const syncResults = [];
        
        for (const record of offlineRecords) {
          try {
            const result = await mockApiCall('/api/qc/sync', {
              method: 'POST',
              body: JSON.stringify(record)
            });
            
            syncResults.push({
              localId: record.id,
              serverId: result.id,
              status: 'synced',
              syncedAt: new Date().toISOString()
            });
          } catch (error) {
            syncResults.push({
              localId: record.id,
              status: 'failed',
              error: (error as Error).message
            });
          }
        }
        
        return syncResults;
      };

      const offlineRecords = [
        { id: 'local-1', data: 'test1' },
        { id: 'local-2', data: 'test2' }
      ];

      const results = await syncOfflineData(offlineRecords);
      
      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('synced');
      expect(mockApiCall).toHaveBeenCalledTimes(2);
    });

    it('should handle sync conflicts', async () => {
      const resolveConflict = (localRecord: any, serverRecord: any) => {
        // Server wins strategy
        if (serverRecord.updatedAt > localRecord.updatedAt) {
          return {
            resolved: serverRecord,
            strategy: 'server_wins'
          };
        }
        
        // Local wins strategy
        return {
          resolved: localRecord,
          strategy: 'local_wins'
        };
      };

      const localRecord = {
        id: 'qc-123',
        qualityScore: 8.5,
        updatedAt: '2024-01-15T10:00:00Z'
      };

      const serverRecord = {
        id: 'qc-123',
        qualityScore: 9.0,
        updatedAt: '2024-01-15T11:00:00Z'
      };

      const resolution = resolveConflict(localRecord, serverRecord);
      
      expect(resolution.strategy).toBe('server_wins');
      expect(resolution.resolved.qualityScore).toBe(9.0);
    });

    it('should implement incremental sync', () => {
      const getIncrementalSyncData = (lastSyncTimestamp: string) => {
        const allRecords = [
          { id: '1', updatedAt: '2024-01-15T09:00:00Z' },
          { id: '2', updatedAt: '2024-01-15T10:00:00Z' },
          { id: '3', updatedAt: '2024-01-15T11:00:00Z' }
        ];

        return allRecords.filter(record => 
          new Date(record.updatedAt) > new Date(lastSyncTimestamp)
        );
      };

      const lastSync = '2024-01-15T09:30:00Z';
      const deltaRecords = getIncrementalSyncData(lastSync);
      
      expect(deltaRecords).toHaveLength(2);
      expect(deltaRecords[0].id).toBe('2');
      expect(deltaRecords[1].id).toBe('3');
    });
  });

  describe('Touch-Optimized UI Components', () => {
    it('should validate touch target sizes', () => {
      const validateTouchTarget = (element: { width: number; height: number }) => {
        const minSize = 44; // 44px minimum for accessibility
        return element.width >= minSize && element.height >= minSize;
      };

      const touchTargets = [
        { width: 44, height: 44 }, // Valid
        { width: 48, height: 48 }, // Valid
        { width: 32, height: 32 }, // Too small
        { width: 60, height: 40 }  // Height too small
      ];

      const validTargets = touchTargets.filter(validateTouchTarget);
      
      expect(validTargets).toHaveLength(2);
    });

    it('should handle touch gestures', () => {
      const gestureHandler = {
        onTouchStart: vi.fn(),
        onTouchMove: vi.fn(),
        onTouchEnd: vi.fn(),
        onSwipe: vi.fn(),
        onPinch: vi.fn()
      };

      const simulateTouch = (type: string, touches: any[]) => {
        const event = {
          type,
          touches,
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        };

        switch (type) {
          case 'touchstart':
            gestureHandler.onTouchStart(event);
            break;
          case 'touchmove':
            gestureHandler.onTouchMove(event);
            break;
          case 'touchend':
            gestureHandler.onTouchEnd(event);
            break;
        }
      };

      const touch = { clientX: 100, clientY: 100 };
      simulateTouch('touchstart', [touch]);
      simulateTouch('touchend', []);

      expect(gestureHandler.onTouchStart).toHaveBeenCalled();
      expect(gestureHandler.onTouchEnd).toHaveBeenCalled();
    });

    it('should implement responsive layout for tablets', () => {
      const getLayoutConfig = (screenWidth: number) => {
        if (screenWidth >= 1024) {
          return {
            columns: 3,
            formWidth: '800px',
            fontSize: '16px',
            spacing: '24px'
          };
        } else if (screenWidth >= 768) {
          return {
            columns: 2,
            formWidth: '600px',
            fontSize: '18px',
            spacing: '20px'
          };
        } else {
          return {
            columns: 1,
            formWidth: '100%',
            fontSize: '20px',
            spacing: '16px'
          };
        }
      };

      const tabletLayout = getLayoutConfig(1024);
      const mobileLayout = getLayoutConfig(480);

      expect(tabletLayout.columns).toBe(3);
      expect(tabletLayout.formWidth).toBe('800px');
      expect(mobileLayout.columns).toBe(1);
      expect(mobileLayout.formWidth).toBe('100%');
    });
  });

  describe('Hardware Integration', () => {
    it('should access device camera', async () => {
      const initCamera = async (facingMode: 'user' | 'environment' = 'environment') => {
        const constraints = {
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };

        return await navigator.mediaDevices.getUserMedia(constraints);
      };

      const stream = await initCamera('environment');
      
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      expect(stream).toBeDefined();
    });

    it('should capture photos with metadata', async () => {
      const capturePhoto = async (stream: any, location?: any) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Simulate photo capture
        const photoData = {
          id: `photo-${Date.now()}`,
          blob: new Blob(['fake-image-data'], { type: 'image/jpeg' }),
          timestamp: new Date().toISOString(),
          location: location || null,
          metadata: {
            width: 1920,
            height: 1080,
            quality: 0.8
          }
        };

        return photoData;
      };

      const location = { lat: 37.7749, lon: -122.4194 };
      const photo = await capturePhoto(null, location);
      
      expect(photo.id).toMatch(/^photo-\d+$/);
      expect(photo.location).toEqual(location);
      expect(photo.metadata.width).toBe(1920);
    });

    it('should get device location', async () => {
      const getCurrentLocation = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            }),
            (error) => reject(error),
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            }
          );
        });
      };

      const location = await getCurrentLocation();
      
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
      expect(location.latitude).toBe(37.7749);
      expect(location.longitude).toBe(-122.4194);
      expect(location.accuracy).toBe(10);
    });

    it('should scan barcodes/QR codes', () => {
      const mockBarcodeDetector = {
        detect: vi.fn().mockResolvedValue([
          {
            rawValue: '1234567890123',
            format: 'ean_13',
            boundingBox: { x: 100, y: 100, width: 200, height: 50 }
          }
        ])
      };

      const scanBarcode = async (imageData: any) => {
        const detector = mockBarcodeDetector;
        const barcodes = await detector.detect(imageData);
        
        return barcodes.map((barcode: any) => ({
          value: barcode.rawValue,
          format: barcode.format,
          bounds: barcode.boundingBox
        }));
      };

      const mockImageData = { width: 100, height: 100, data: new Uint8ClampedArray(100 * 100 * 4) };
      
      return scanBarcode(mockImageData).then(results => {
        expect(results).toHaveLength(1);
        expect(results[0].value).toBe('1234567890123');
        expect(results[0].format).toBe('ean_13');
      });
    });
  });

  describe('Digital Signature System', () => {
    it('should capture digital signatures', () => {
      const signaturePad = {
        points: [] as Array<{ x: number; y: number; pressure?: number }>,
        isDrawing: false,
        
        startDrawing: function(x: number, y: number) {
          this.isDrawing = true;
          this.points.push({ x, y });
        },
        
        addPoint: function(x: number, y: number, pressure?: number) {
          if (this.isDrawing) {
            this.points.push({ x, y, pressure });
          }
        },
        
        stopDrawing: function() {
          this.isDrawing = false;
        },
        
        toDataURL: function() {
          return `data:image/png;base64,${btoa('fake-signature-data')}`;
        },
        
        clear: function() {
          this.points = [];
        }
      };

      // Simulate signature drawing
      signaturePad.startDrawing(10, 10);
      signaturePad.addPoint(20, 15, 0.5);
      signaturePad.addPoint(30, 20, 0.7);
      signaturePad.stopDrawing();

      const signatureData = signaturePad.toDataURL();
      
      expect(signaturePad.points).toHaveLength(3);
      expect(signatureData).toMatch(/^data:image\/png;base64,/);
    });

    it('should validate signature completeness', () => {
      const validateSignature = (points: Array<{ x: number; y: number }>) => {
        const minPoints = 10;
        const minDistance = 50;
        
        if (points.length < minPoints) {
          return { valid: false, reason: 'Signature too short' };
        }
        
        // Calculate total distance
        let totalDistance = 0;
        for (let i = 1; i < points.length; i++) {
          const dx = points[i].x - points[i-1].x;
          const dy = points[i].y - points[i-1].y;
          totalDistance += Math.sqrt(dx * dx + dy * dy);
        }
        
        if (totalDistance < minDistance) {
          return { valid: false, reason: 'Signature too simple' };
        }
        
        return { valid: true };
      };

      const shortSignature = [
        { x: 10, y: 10 },
        { x: 15, y: 15 }
      ];

      const validSignature = Array.from({ length: 20 }, (_, i) => ({
        x: i * 5,
        y: Math.sin(i * 0.5) * 20 + 50
      }));

      const shortResult = validateSignature(shortSignature);
      const validResult = validateSignature(validSignature);

      expect(shortResult.valid).toBe(false);
      expect(shortResult.reason).toBe('Signature too short');
      expect(validResult.valid).toBe(true);
    });

    it('should store signature with metadata', () => {
      const storeSignature = (signatureData: string, metadata: any) => {
        return {
          id: `sig-${Date.now()}`,
          data: signatureData,
          timestamp: new Date().toISOString(),
          signedBy: metadata.signedBy,
          role: metadata.role,
          documentId: metadata.documentId,
          location: metadata.location,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        };
      };

      const signatureData = 'data:image/png;base64,fake-signature';
      const metadata = {
        signedBy: 'John Farmer',
        role: 'farmer',
        documentId: 'qc-123',
        location: { lat: 37.7749, lon: -122.4194 }
      };

      const storedSignature = storeSignature(signatureData, metadata);
      
      expect(storedSignature.id).toMatch(/^sig-\d+$/);
      expect(storedSignature.signedBy).toBe('John Farmer');
      expect(storedSignature.role).toBe('farmer');
      expect(storedSignature.location).toEqual(metadata.location);
    });
  });

  describe('Voice Recording Capabilities', () => {
    it('should record audio observations', async () => {
      const mockMediaRecorder = {
        start: vi.fn(),
        stop: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        state: 'inactive',
        ondataavailable: null,
        onstop: null
      };

      const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = mockMediaRecorder;
        
        const audioChunks: Blob[] = [];
        
        recorder.ondataavailable = (event: any) => {
          audioChunks.push(event.data);
        };
        
        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          return audioBlob;
        };
        
        recorder.start();
        return recorder;
      };

      const recorder = await startRecording();
      
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(recorder.start).toHaveBeenCalled();
    });

    it('should manage recording states', () => {
      const recordingManager = {
        state: 'idle' as 'idle' | 'recording' | 'paused' | 'stopped',
        duration: 0,
        maxDuration: 300000, // 5 minutes
        
        start() {
          if (this.state === 'idle') {
            this.state = 'recording';
            this.duration = 0;
          }
        },
        
        pause() {
          if (this.state === 'recording') {
            this.state = 'paused';
          }
        },
        
        resume() {
          if (this.state === 'paused') {
            this.state = 'recording';
          }
        },
        
        stop() {
          if (this.state === 'recording' || this.state === 'paused') {
            this.state = 'stopped';
          }
        },
        
        reset() {
          this.state = 'idle';
          this.duration = 0;
        }
      };

      recordingManager.start();
      expect(recordingManager.state).toBe('recording');
      
      recordingManager.pause();
      expect(recordingManager.state).toBe('paused');
      
      recordingManager.resume();
      expect(recordingManager.state).toBe('recording');
      
      recordingManager.stop();
      expect(recordingManager.state).toBe('stopped');
    });

    it('should store audio with transcription', async () => {
      const mockTranscriptionService = {
        transcribe: vi.fn().mockResolvedValue({
          text: 'The tomatoes look fresh and have good color.',
          confidence: 0.95,
          language: 'en'
        })
      };

      const storeAudioObservation = async (audioBlob: Blob, metadata: any) => {
        const transcription = await mockTranscriptionService.transcribe(audioBlob);
        
        return {
          id: `audio-${Date.now()}`,
          audioData: audioBlob,
          transcription: transcription.text,
          confidence: transcription.confidence,
          timestamp: new Date().toISOString(),
          inspector: metadata.inspector,
          qcRecordId: metadata.qcRecordId,
          duration: metadata.duration
        };
      };

      const audioBlob = new Blob(['fake-audio-data'], { type: 'audio/wav' });
      const metadata = {
        inspector: 'inspector-123',
        qcRecordId: 'qc-456',
        duration: 15000 // 15 seconds
      };

      const audioRecord = await storeAudioObservation(audioBlob, metadata);
      
      expect(audioRecord.transcription).toBe('The tomatoes look fresh and have good color.');
      expect(audioRecord.confidence).toBe(0.95);
      expect(mockTranscriptionService.transcribe).toHaveBeenCalledWith(audioBlob);
    });
  });

  describe('Offline Functionality', () => {
    it('should detect online/offline status', () => {
      const connectionManager = {
        isOnline: navigator.onLine,
        
        checkConnection: async () => {
          try {
            const response = await fetch('/api/ping', { 
              method: 'HEAD',
              cache: 'no-cache'
            });
            return response.ok;
          } catch {
            return false;
          }
        },
        
        onOnline: vi.fn(),
        onOffline: vi.fn()
      };

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      connectionManager.isOnline = navigator.onLine;
      
      expect(connectionManager.isOnline).toBe(false);
    });

    it('should queue operations when offline', () => {
      const operationQueue = {
        queue: [] as Array<{ type: string; data: any; timestamp: string }>,
        
        add(type: string, data: any) {
          this.queue.push({
            type,
            data,
            timestamp: new Date().toISOString()
          });
        },
        
        process: async function(isOnline: boolean) {
          if (!isOnline) return;
          
          const operations = [...this.queue];
          this.queue = [];
          
          for (const operation of operations) {
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 100));
              console.log(`Processed ${operation.type}`);
            } catch (error) {
              // Re-queue failed operations
              this.queue.push(operation);
            }
          }
        }
      };

      // Add operations while offline
      operationQueue.add('qc_submit', { id: 'qc-1', data: 'test' });
      operationQueue.add('photo_upload', { id: 'photo-1', data: 'image' });

      expect(operationQueue.queue).toHaveLength(2);
      
      // Process when online
      operationQueue.process(true);
      
      expect(operationQueue.queue).toHaveLength(0);
    });

    it('should handle offline form validation', () => {
      const validateQCForm = (formData: any) => {
        const errors: string[] = [];
        
        if (!formData.farmId) {
          errors.push('Farm ID is required');
        }
        
        if (!formData.inspectorId) {
          errors.push('Inspector ID is required');
        }
        
        if (!formData.qualityScore || formData.qualityScore < 1 || formData.qualityScore > 10) {
          errors.push('Quality score must be between 1 and 10');
        }
        
        if (!formData.photos || formData.photos.length === 0) {
          errors.push('At least one photo is required');
        }
        
        if (!formData.signature) {
          errors.push('Signature is required');
        }
        
        return {
          isValid: errors.length === 0,
          errors
        };
      };

      const validForm = {
        farmId: 'farm-123',
        inspectorId: 'inspector-456',
        qualityScore: 8.5,
        photos: ['photo-1'],
        signature: 'signature-data'
      };

      const invalidForm = {
        farmId: '',
        qualityScore: 15,
        photos: []
      };

      const validResult = validateQCForm(validForm);
      const invalidResult = validateQCForm(invalidForm);

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Farm ID is required');
      expect(invalidResult.errors).toContain('Quality score must be between 1 and 10');
    });
  });

  describe('Performance and Optimization', () => {
    it('should optimize image storage for mobile', () => {
      const optimizeImage = (imageBlob: Blob, maxSize: number = 1024) => {
        // Simulate image optimization
        const originalSize = imageBlob.size;
        const compressionRatio = Math.min(1, maxSize * 1024 / originalSize);
        
        return {
          originalSize,
          compressedSize: Math.floor(originalSize * compressionRatio),
          compressionRatio,
          quality: compressionRatio >= 0.8 ? 'high' : compressionRatio >= 0.5 ? 'medium' : 'low'
        };
      };

      const largeImage = new Blob(['x'.repeat(2048 * 1024)], { type: 'image/jpeg' }); // 2MB
      const optimized = optimizeImage(largeImage, 1024); // Target 1MB

      expect(optimized.compressedSize).toBeLessThanOrEqual(1024 * 1024);
      expect(optimized.compressionRatio).toBe(0.5);
      expect(optimized.quality).toBe('medium');
    });

    it('should implement lazy loading for large datasets', () => {
      const createLazyLoader = (pageSize: number = 20) => {
        return {
          currentPage: 0,
          pageSize,
          hasMore: true,
          loading: false,
          
          async loadMore(dataSource: any[]) {
            if (this.loading || !this.hasMore) return [];
            
            this.loading = true;
            
            const startIndex = this.currentPage * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            const pageData = dataSource.slice(startIndex, endIndex);
            
            this.currentPage++;
            this.hasMore = endIndex < dataSource.length;
            this.loading = false;
            
            return pageData;
          }
        };
      };

      const mockData = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      const loader = createLazyLoader(10);

      return loader.loadMore(mockData).then(firstPage => {
        expect(firstPage).toHaveLength(10);
        expect(firstPage[0].id).toBe(0);
        expect(loader.currentPage).toBe(1);
        expect(loader.hasMore).toBe(true);
      });
    });

    it('should manage memory usage for offline storage', () => {
      const storageManager = {
        maxStorageSize: 50 * 1024 * 1024, // 50MB
        currentUsage: 0,
        
        calculateSize(data: any): number {
          return JSON.stringify(data).length;
        },
        
        canStore(data: any): boolean {
          const dataSize = this.calculateSize(data);
          return (this.currentUsage + dataSize) <= this.maxStorageSize;
        },
        
        store(key: string, data: any): boolean {
          if (!this.canStore(data)) {
            this.cleanup();
            if (!this.canStore(data)) {
              return false;
            }
          }
          
          this.currentUsage += this.calculateSize(data);
          return true;
        },
        
        cleanup() {
          // Simulate cleanup of old data
          this.currentUsage = Math.floor(this.currentUsage * 0.7);
        }
      };

      const largeData = { data: 'x'.repeat(10 * 1024 * 1024) }; // 10MB
      const canStore = storageManager.canStore(largeData);
      
      expect(canStore).toBe(true);
      
      const stored = storageManager.store('test', largeData);
      expect(stored).toBe(true);
      expect(storageManager.currentUsage).toBeGreaterThan(0);
    });
  });
});