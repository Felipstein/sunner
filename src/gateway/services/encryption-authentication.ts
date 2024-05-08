import crypto from 'node:crypto';

export class EncryptionAuthenticationService {
  static generateKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
      modulusLength: 1024,
      publicKeyEncoding: {
        type: 'spki',
        format: 'der',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'der',
      },
    });
  }

  static generateVerifyToken() {
    return crypto.randomBytes(4);
  }

  static encryptData(data: Buffer | string, publicKeyPem: string) {
    return crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_PADDING,
        oaepHash: 'sha256',
      },
      typeof data === 'string' ? Buffer.from(data) : data,
    );
  }

  static decryptData(encryptedData: Buffer, privateKeyPem: string) {
    return crypto.privateDecrypt(
      {
        key: privateKeyPem,
        padding: crypto.constants.RSA_PKCS1_PADDING,
        oaepHash: 'sha256',
      },
      encryptedData,
    );
  }

  static convertDerToPem(buffer: Buffer, type: 'private' | 'public') {
    const pemHeader =
      type === 'public' ? '-----BEGIN PUBLIC KEY-----\n' : '-----BEGIN PRIVATE KEY-----\n';
    const pemFooter =
      type === 'public' ? '\n-----END PUBLIC KEY-----' : '\n-----END PRIVATE KEY-----';
    const base64String = buffer.toString('base64');
    const formattedBase64 = base64String.match(/.{1,64}/g)?.join('\n');

    return pemHeader + formattedBase64 + pemFooter;
  }
}
