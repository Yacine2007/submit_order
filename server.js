const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const MONGODB_URI = 'mongodb+srv://byprosprt2007_db_user:XkdKib4f18KnnSEQ@ac-0vbwrzk-shard.d8rcisl.mongodb.net/DashboardDB?retryWrites=true&w=majority';
const DB_NAME = 'bypro_orders';
const COLLECTION = 'orders';

app.post('/submit_order', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const order = req.body;
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);
    const result = await collection.insertOne(order);
    await client.close();

    return res.status(200).json({ status: 'success', insertedId: result.insertedId.toString() });
  } catch (error) {
    console.error('MongoDB Error:', error);
    return res.status(500).json({ status: 'error', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));