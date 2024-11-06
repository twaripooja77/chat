const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../helpers/getConversation');

const app = express();

// Create HTTP server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// To map user IDs to socket IDs for targeted messaging
const userSocketMap = {};

io.on('connection', async (socket) => {
  console.log('Connected user:', socket.id);

  const token = socket.handshake.auth.token;
  const user = await getUserDetailsFromToken(token);

  // Add user to socket map
  userSocketMap[user?._id?.toString()] = socket.id;

  // Notify all connected clients about online users
  io.emit('onlineUser', Object.keys(userSocketMap));

  // Join the user's own room to receive private messages
  socket.join(user?._id.toString());

  socket.on('message-page', async (userId) => {
    console.log('UserID:', userId);
    const userDetails = await UserModel.findById(userId).select('-password');
    
    const payload = {
      _id: userDetails?._id,
      name: userDetails?.name,
      email: userDetails?.email,
      profile_pic: userDetails?.profile_pic,
      online: userSocketMap[userId] !== undefined
    };

    socket.emit('message-user', payload);

    // Get previous messages
    const conversation = await ConversationModel.findOne({
      "$or": [
        { sender: user?._id, receiver: userId },
        { sender: userId, receiver: user?._id }
      ]
    }).populate('messages').sort({ updatedAt: -1 });

    socket.emit('message', conversation?.messages || []);
  });

  socket.on('new message', async (data) => {
    let conversation = await ConversationModel.findOne({
      "$or": [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender }
      ]
    });

    if (!conversation) {
      const createConversation = new ConversationModel({
        sender: data?.sender,
        receiver: data?.receiver
      });
      conversation = await createConversation.save();
    }

    const message = new MessageModel({
      text: data.text,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      msgByUserId: data?.msgByUserId
    });

    const savedMessage = await message.save();

    // Update conversation with the new message
    await ConversationModel.updateOne(
      { _id: conversation?._id },
      { "$push": { messages: savedMessage?._id } }
    );

    const updatedConversation = await ConversationModel.findOne({
      "$or": [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender }
      ]
    }).populate('messages').sort({ updatedAt: -1 });

    // Emit the updated messages to both sender and receiver in real-time
    io.to(data?.sender).emit('message', updatedConversation?.messages || []);
    io.to(data?.receiver).emit('message', updatedConversation?.messages || []);

    // Send the updated conversation list
    const senderConversation = await getConversation(data?.sender);
    const receiverConversation = await getConversation(data?.receiver);

    io.to(data?.sender).emit('conversation', senderConversation);
    io.to(data?.receiver).emit('conversation', receiverConversation);
  });

  socket.on('sidebar', async (currentUserId) => {
    const conversation = await getConversation(currentUserId);
    socket.emit('conversation', conversation);
  });

  socket.on('seen', async (msgByUserId) => {
    let conversation = await ConversationModel.findOne({
      "$or": [
        { sender: user?._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user?._id }
      ]
    });

    const conversationMessageId = conversation?.messages || [];

    await MessageModel.updateMany(
      { _id: { "$in": conversationMessageId }, msgByUserId: msgByUserId },
      { "$set": { seen: true } }
    );

    const conversationSender = await getConversation(user?._id?.toString());
    const conversationReceiver = await getConversation(msgByUserId);

    io.to(user?._id?.toString()).emit('conversation', conversationSender);
    io.to(msgByUserId).emit('conversation', conversationReceiver);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    delete userSocketMap[user?._id?.toString()];
    console.log('Disconnected user:', socket.id);
    io.emit('onlineUser', Object.keys(userSocketMap));
  });
});

module.exports = { app, server };
