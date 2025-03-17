require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
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
app.get('/deliveries', async (req, res) => {
    const deliveries = await Delivery.find();
    res.json(deliveries);
});

app.post('/deliveries', async (req, res) => {
    const newDelivery = new Delivery(req.body);
    await newDelivery.save();
    res.json({ message: 'Delivery added!', newDelivery });
});

app.put('/deliveries/:id', async (req, res) => {
    await Delivery.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Delivery updated!' });
});

// Serve Frontend
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Delivery Management</title>
    </head>
    <body>
        <h1>Delivery Management System</h1>
        <form id="deliveryForm">
            <input type="text" id="name" placeholder="Customer Name" required>
            <input type="text" id="address" placeholder="Address" required>
            <button type="submit">Add Delivery</button>
        </form>
        <button onclick="fetchDeliveries()">Show Deliveries</button>
        <ul id="deliveries"></ul>

        <script>
            document.getElementById('deliveryForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const name = document.getElementById('name').value;
                const address = document.getElementById('address').value;
                fetch('/deliveries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customerName: name, address: address })
                }).then(() => {
                    document.getElementById('name').value = '';
                    document.getElementById('address').value = '';
                    fetchDeliveries();
                });
            });

            function fetchDeliveries() {
                fetch('/deliveries')
                    .then(res => res.json())
                    .then(data => {
                        const list = document.getElementById('deliveries');
                        list.innerHTML = '';
                        data.forEach(delivery => {
                            list.innerHTML += \`<li>\${delivery.customerName} - \${delivery.address} - \${delivery.status}</li>\`;
                        });
                    });
            }
        </script>
    </body>
    </html>
    `);
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
