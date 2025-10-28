// Mock for openid-client ESM module
module.exports = {
  Issuer: class Issuer {
    static async discover() {
      return {
        Client: class Client {
          constructor() {}
          callback() {}
          userinfo() {}
        },
      };
    }
  },
  generators: {
    codeVerifier: () => 'mock-code-verifier',
    codeChallenge: () => 'mock-code-challenge',
    state: () => 'mock-state',
    nonce: () => 'mock-nonce',
  },
  custom: {},
};
