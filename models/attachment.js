const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'message', required: true },
    url: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'video', 'file'], required: true },
    size: { type: Number, required: true }
}, { collection: 'attachment' });

module.exports = mongoose.model('attachment', attachmentSchema);
