const crypto = require('crypto');

class DataEncryption {
  static ALGORITHM = 'aes-256-gcm'
  static KEY = crypto.scryptSync(
    'default-encryption-key',
    'salt',
    32
  )

  static encryptLegacy(text) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.ALGORITHM, this.KEY)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }

  static encrypt(text) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.KEY, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }
}

try {
  console.log(DataEncryption.KEY.length);
  DataEncryption.encryptLegacy("Hello");
} catch(e) {}
console.log(DataEncryption.encrypt("Hello World"));
