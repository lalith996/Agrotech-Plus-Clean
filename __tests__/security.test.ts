import { DataEncryption } from '../lib/security';

describe('DataEncryption', () => {
  it('encrypts and decrypts correctly with new method', () => {
    const original = 'my-secret-data';
    const encrypted = DataEncryption.encrypt(original);
    const decrypted = DataEncryption.decrypt(encrypted);
    expect(decrypted).toBe(original);
  });
});
