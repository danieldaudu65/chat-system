const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
    groupName: Strings,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    groupImage: Strings,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'group' })

module.exports = mongoose.model('group', groupSchema);
