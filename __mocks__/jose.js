// Mock for jose ESM module
module.exports = {
  jwtVerify: jest.fn(() => Promise.resolve({ payload: {}, protectedHeader: {} })),
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn(() => Promise.resolve('mock-jwt-token')),
  })),
  importJWK: jest.fn(() => Promise.resolve({})),
  generateKeyPair: jest.fn(() =>
    Promise.resolve({
      publicKey: {},
      privateKey: {},
    })
  ),
  compactDecrypt: jest.fn(() => Promise.resolve({ plaintext: new Uint8Array() })),
  compactEncrypt: jest.fn(() => Promise.resolve('mock-encrypted-token')),
  CompactEncrypt: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    encrypt: jest.fn(() => Promise.resolve('mock-encrypted-token')),
  })),
  exportJWK: jest.fn(() => Promise.resolve({})),
  generateSecret: jest.fn(() => Promise.resolve(new Uint8Array())),
};
