const crypto = require('crypto');
try {
  const decipher = crypto.createDecipher('aes-256-gcm', 'secret');
  console.log("Success");
} catch (e) {
  console.log("Error:", e.message);
}
