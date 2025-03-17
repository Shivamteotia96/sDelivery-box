const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Delivery', DeliverySchema);
