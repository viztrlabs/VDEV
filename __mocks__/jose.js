/**
 * Manual mock for `jose` (ESM-only package).
 *
 * Jest's CJS transform can't handle jose's ESM output. Since our security
 * tests only verify exports and config checks (not actual JWT operations),
 * this mock satisfies the import chain without needing real crypto.
 */

async function SignJwt(payload, key, opts) {
  return 'mock.jwt.token';
}

async function importPKCS8(pem, alg) {
  return pem;
}

async function importSPKI(pem, alg) {
  return pem;
}

module.exports = {
  SignJwt,
  importPKCS8,
  importSPKI,
  compactDecrypt: async () => ({ plaintext: Buffer.from('{}') }),
  compactEncrypt: async () => 'mock.compact',
  CompactEncrypt: class {
    constructor(plaintext) { this.plaintext = plaintext; }
    setProtectedHeader(h) { this.header = h; return this; }
    async encrypt(key) { return 'mock.encrypted'; }
  },
  CompactDecrypt: class {
    constructor(ciphertext) { this.ciphertext = ciphertext; }
    setKey(k) { this.key = k; return this; }
    async decrypt() { return { plaintext: Buffer.from('{}') }; }
  },
};
