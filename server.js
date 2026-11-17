const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Item = require('./models/Item');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and serve static frontend files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB (Atlas in production via MONGODB_URI, local otherwise)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crud_database')
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// 1. CREATE - Add a new record
app.post('/api/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. READ - Get all records
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. UPDATE - Modify an existing record by ID
app.put('/api/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. DELETE - Remove a record by ID
app.delete('/api/items/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});