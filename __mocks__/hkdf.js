// Mock for @panva/hkdf ESM module
module.exports = jest.fn((secret, keylen, info, hash) => {
  // Return a buffer of the requested length
  return Promise.resolve(Buffer.alloc(keylen));
});

module.exports.default = module.exports;
