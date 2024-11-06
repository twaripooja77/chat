const fs = require('fs');
const crypto = require('crypto');
const io = require('socket.io-client');

// Load the server's public key for encryption
const serverPublicKey = fs.readFileSync('serverPublicKey.pem', 'utf8');
console.log("Server's Public Key (for encryption):\n", serverPublicKey);

// Connect to server
const socket = io('http://localhost:3000'); // Update with your server URL

// Encrypt a message's text field using the server's public key
function encryptTextField(text) {
    const buffer = Buffer.from(text, 'utf8');
    const encrypted = crypto.publicEncrypt(serverPublicKey, buffer);
    return encrypted.toString('base64');
}

// Send a message with encrypted text
function sendMessage(message) {
    // Encrypt the `text` field of the message object
    const encryptedText = encryptTextField(message.text);
    const encryptedMessage = {
        ...message,
        text: encryptedText // Replace the text field with the encrypted version
    };

    console.log('Encrypted message text:', encryptedText); // Log for verification
    socket.emit('message', encryptedMessage);
}

// Listen for incoming messages from server and decrypt the `text` field
socket.on('message', (encryptedMessage) => {
    console.log('Received encrypted message:', encryptedMessage);
    const decryptedMessage = {
        ...encryptedMessage,
        text: decryptTextField(encryptedMessage.text) // Decrypt the text field
    };
    console.log('Decrypted message:', decryptedMessage);
});

// Decrypt the text field of incoming messages using the client’s private key
function decryptTextField(encryptedText) {
    const clientPrivateKey = fs.readFileSync('clientPrivateKey.pem', 'utf8');
    const buffer = Buffer.from(encryptedText, 'base64');
    const decrypted = crypto.privateDecrypt(clientPrivateKey, buffer);
    return decrypted.toString('utf8');
}
