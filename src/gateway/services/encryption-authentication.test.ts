import { bitUtils } from '../utils/bit';

import {
  convertDerToPem,
  decryptData,
  encryptData,
  generateServerEncryption,
} from './encryption-authentication';

describe('Encryption Authentication', () => {
  it('should encrypt and decrypt same string', () => {
    const { serverPublicKey, serverPrivateKey } = generateServerEncryption();

    const sampleData = bitUtils.writeString('Hello, encrypted world!');

    const encryptedData = encryptData(sampleData, convertDerToPem(serverPublicKey, 'public'));
    const decryptedData = decryptData(encryptedData, convertDerToPem(serverPrivateKey, 'private'));

    expect(decryptedData).toEqual(sampleData);
    expect(bitUtils.readString(decryptedData).value).toBe(bitUtils.readString(sampleData).value);
  });
});
