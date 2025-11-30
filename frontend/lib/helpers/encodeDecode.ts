import CryptoJS from "crypto-js";

export const encode = (value: string) => {
  if (!process.env.SALT) {
    throw new Error("Missing 'SALT'");
  }

  if (!value) {
    throw new Error("Missing value");
  }

  return CryptoJS.AES.encrypt(value, process.env.SALT).toString();
};

export const decode = (value: string) => {
  if (!process.env.SALT) {
    throw new Error("Missing 'SALT'");
  }

  if (!value) {
    throw new Error("Missing value");
  }

  const bytes = CryptoJS.AES.decrypt(value, process.env.SALT);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Helper to parse expiry time to seconds
export const parseExpiryToSeconds = (expiry: string): number => {
  const value = Number.parseInt(expiry);
  if (expiry.endsWith("d")) return value * 24 * 60 * 60;
  if (expiry.endsWith("h")) return value * 60 * 60;
  if (expiry.endsWith("m")) return value * 60;
  return value;
};
