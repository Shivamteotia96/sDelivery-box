// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Define a Delivery schema
const DeliverySchema = new mongoose.Schema({
  orderId: String,
  status: String,
  location: String,
  estimatedDelivery: Date
});

const Delivery = mongoose.model("Delivery", DeliverySchema);

// Routes
app.get("/deliveries", async (req, res) => {
  const deliveries = await Delivery.find();
  res.json(deliveries);
});

app.post("/deliveries", async (req, res) => {
  const newDelivery = new Delivery(req.body);
  await newDelivery.save();
  res.json(newDelivery);
});

app.put("/deliveries/:id", async (req, res) => {
  const updatedDelivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedDelivery);
});

app.delete("/deliveries/:id", async (req, res) => {
  await Delivery.findByIdAndDelete(req.params.id);
  res.json({ message: "Delivery deleted" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// FRONTEND: Angular Component (src/app/deliveries/deliveries.component.ts)
import { Component, OnInit } from '@angular/core';
import { DeliveryService } from '../delivery.service';

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.component.html',
  styleUrls: ['./deliveries.component.css']
})
export class DeliveriesComponent implements OnInit {
  deliveries: any[] = [];
  newDelivery = { orderId: '', status: '', location: '', estimatedDelivery: '' };
  editMode = false;
  editingDelivery: any = null;

  constructor(private deliveryService: DeliveryService) {}

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries() {
    this.deliveryService.getDeliveries().subscribe(data => {
      this.deliveries = data;
    });
  }

  addDelivery() {
    if (this.editMode) {
      this.deliveryService.updateDelivery(this.editingDelivery._id, this.newDelivery).subscribe(() => {
        this.loadDeliveries();
        this.resetForm();
      });
    } else {
      this.deliveryService.addDelivery(this.newDelivery).subscribe(() => {
        this.loadDeliveries();
        this.resetForm();
      });
    }
  }

  editDelivery(delivery: any) {
    this.newDelivery = { ...delivery };
    this.editingDelivery = delivery;
    this.editMode = true;
  }

  deleteDelivery(id: string) {
    this.deliveryService.deleteDelivery(id).subscribe(() => {
      this.loadDeliveries();
    });
  }

  resetForm() {
    this.newDelivery = { orderId: '', status: '', location: '', estimatedDelivery: '' };
    this.editMode = false;
    this.editingDelivery = null;
  }
}

// FRONTEND: Angular Template (src/app/deliveries/deliveries.component.html)
<div>
  <h2>Delivery List</h2>
  <mat-list>
    <mat-list-item *ngFor="let delivery of deliveries">
      <span>{{ delivery.orderId }} - {{ delivery.status }} - {{ delivery.location }} - {{ delivery.estimatedDelivery | date }}</span>
      <span class="actions">
        <button mat-button color="primary" (click)="editDelivery(delivery)">Edit</button>
        <button mat-button color="warn" (click)="deleteDelivery(delivery._id)">Delete</button>
      </span>
    </mat-list-item>
  </mat-list>

  <h3>{{ editMode ? 'Edit Delivery' : 'Add New Delivery' }}</h3>
  <form (ngSubmit)="addDelivery()">
    <mat-form-field appearance="fill">
      <mat-label>Order ID</mat-label>
      <input matInput [(ngModel)]="newDelivery.orderId" name="orderId" required>
    </mat-form-field>

    <mat-form-field appearance="fill">
      <mat-label>Status</mat-label>
      <input matInput [(ngModel)]="newDelivery.status" name="status" required>
    </mat-form-field>

    <mat-form-field appearance="fill">
      <mat-label>Location</mat-label>
      <input matInput [(ngModel)]="newDelivery.location" name="location" required>
    </mat-form-field>

    <mat-form-field appearance="fill">
      <mat-label>Estimated Delivery</mat-label>
      <input matInput type="date" [(ngModel)]="newDelivery.estimatedDelivery" name="estimatedDelivery" required>
    </mat-form-field>

    <button mat-raised-button color="primary" type="submit">{{ editMode ? 'Update Delivery' : 'Add Delivery' }}</button>
    <button mat-button (click)="resetForm()" *ngIf="editMode">Cancel</button>
  </form>
</div>

// FRONTEND: Angular Styles (src/app/deliveries/deliveries.component.css)
h2, h3 { color: #333; }
mat-list { max-width: 500px; margin: auto; }
.actions { display: flex; gap: 10px; }
mat-form-field { display: block; margin-bottom: 10px; }
