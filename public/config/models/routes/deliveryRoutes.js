const express = require('express');
const Delivery = require('../models/Delivery');

const router = express.Router();

// Get all deliveries
router.get('/', async (req, res) => {
    const deliveries = await Delivery.find();
    res.json(deliveries);
});

// Create a new delivery
router.post('/', async (req, res) => {
    const newDelivery = new Delivery(req.body);
    await newDelivery.save();
    res.json({ message: '✅ Delivery added!', newDelivery });
});

// Update delivery status
router.put('/:id', async (req, res) => {
    await Delivery.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: '✅ Delivery updated!' });
});

// Delete a delivery
router.delete('/:id', async (req, res) => {
    await Delivery.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Delivery deleted!' });
});

module.exports = router;
