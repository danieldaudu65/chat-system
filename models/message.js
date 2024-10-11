const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'chat' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    content: String,
    messageType: { type: String, enum: ['text', 'video', 'file'], default: 'text' },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
}, { collection: 'message' });

module.exports = mongoose.model('message', messageSchema)