import crypto from 'crypto';

const KEY = Buffer.from('6d66fb7debfd15bf716bb14752b9603b'); // 32-byte string
const IV = Buffer.from('716bb14752b9603b'); // 16-byte string


export const encrypt = (data: any): string => {
  try {
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    const cipher = crypto.createCipheriv('aes-256-cbc', KEY, IV);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  } catch (e) {
    console.error('[encrypt] failed:', e);
    throw new Error('Encryption failed');
  }
};

export const decrypt = (encryptedData: string): string => {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.error('[decrypt] failed:', e);
    throw new Error('Decryption failed');
  }
};
