const NodeRSA = require('node-rsa');
const fs = require('fs');

// Generate RSA key pair for the server
const serverKey = new NodeRSA({ b: 512 });
const serverPublicKey = serverKey.exportKey('public');
const serverPrivateKey = serverKey.exportKey('private');

fs.writeFileSync('server/serverPublicKey.pem', serverPublicKey);
fs.writeFileSync('server/serverPrivateKey.pem', serverPrivateKey);

console.log("Server Public Key:\n", serverPublicKey);
console.log("Server Private Key:\n", serverPrivateKey);

// Generate RSA key pair for the client
const clientKey = new NodeRSA({ b: 512 });
const clientPublicKey = clientKey.exportKey('public');
const clientPrivateKey = clientKey.exportKey('private');

fs.writeFileSync('client/clientPublicKey.pem', clientPublicKey);
fs.writeFileSync('client/clientPrivateKey.pem', clientPrivateKey);

console.log("\nClient Public Key:\n", clientPublicKey);
console.log("Client Private Key:\n", clientPrivateKey);

console.log('\nRSA keys generated and saved to files in the "server" and "client" folders.');
