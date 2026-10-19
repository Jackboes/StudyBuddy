const mongoose = require('mongoose');
const schema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, title: String, fileName: String, extractedText: String, summary: String, createdAt: { type: Date, default: Date.now } });
module.exports = mongoose.model('Document', schema);
