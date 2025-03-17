require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error(err));

// Delivery Schema
const DeliverySchema = new mongoose.Schema({
    customerName: String,
    address: String,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
const Delivery = mongoose.model('Delivery', DeliverySchema);

// API Routes
app.get('/api/deliveries', async (req, res) => {
    const deliveries = await Delivery.find();
    res.json(deliveries);
});

app.post('/api/deliveries', async (req, res) => {
    const newDelivery = new Delivery(req.body);
    await newDelivery.save();
    res.json({ message: 'Delivery added!', newDelivery });
});

app.put('/api/deliveries/:id', async (req, res) => {
    await Delivery.findByIdAndUpdate(req.params.id, req.body);
    res.json
