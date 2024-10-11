const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    chatName: { type: String }, 
    usersId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    isGroupChat: { type: Boolean, default: false },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'message' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'chat' });

module.exports = mongoose.model('chat', chatSchema);
