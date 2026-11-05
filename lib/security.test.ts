import { DataEncryption } from './security';
import crypto from 'crypto';

describe('DataEncryption', () => {
  it('encrypts and decrypts correctly', () => {
    const original = 'my-secret-data';
    const encrypted = DataEncryption.encrypt(original);
    const decrypted = DataEncryption.decrypt(encrypted);
    expect(decrypted).toBe(original);
  });
});
