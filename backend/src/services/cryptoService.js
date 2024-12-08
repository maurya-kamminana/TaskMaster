const crypto = require("crypto");

// Crypto Setup
const encryptionKey = crypto.randomBytes(32); // Store this securely in production
const ivLength = 16;

const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (encrypted) => {
  const [ivHex, encryptedText] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
  const decrypted = decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8');
  return decrypted;
};

module.exports = {
  encrypt,
  decrypt,
};
