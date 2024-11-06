const fs = require('fs');
const crypto = require('crypto');
const io = require('socket.io')(3000); // Update with your server configuration

// Load the server's private key for decryption
const serverPrivateKey = fs.readFileSync('serverPrivateKey.pem', 'utf8');

// Load the client's public key for encrypting responses
const clientPublicKey = fs.readFileSync('clientPublicKey.pem', 'utf8');

// Decrypt the `text` field of a message using the server's private key
function decryptTextField(encryptedText) {
    const buffer = Buffer.from(encryptedText, 'base64');
    const decrypted = crypto.privateDecrypt(serverPrivateKey, buffer);
    return decrypted.toString('utf8');
}

// Encrypt the `text` field of a message using the client's public key
function encryptTextField(text) {
    const buffer = Buffer.from(text, 'utf8');
    const encrypted = crypto.publicEncrypt(clientPublicKey, buffer);
    return encrypted.toString('base64');
}

// Handle connection
io.on('connection', (socket) => {
    console.log('Client connected.');

    // Receive and decrypt messages from client
    socket.on('message', (encryptedMessage) => {
        console.log('Received encrypted message from client:', encryptedMessage);
        // console.log("decrypted message:", crypto.randomUUID())

        // Decrypt the `text` field of the message
        const decryptedMessage = {
            ...encryptedMessage,
            text: decryptTextField(encryptedMessage.text)
        };

        console.log('Decrypted message from client:', decryptedMessage);

        // Optionally send a response by re-encrypting the text field
        const responseText = `Server received: ${decryptedMessage.text}`;
        const encryptedResponseMessage = {
            ...decryptedMessage,
            text: encryptTextField(responseText) // Encrypt the text field for response
        };

        socket.emit('message', encryptedResponseMessage);
        console.log('Sent encrypted response to client:', encryptedResponseMessage);
    });
});
