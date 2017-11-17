import express from 'express';
import DataStore from 'nedb-promise';
const itemsRouter = express.Router();
let db;

async function loadDatabase() {
  // Initialize database
  db = new DataStore({ filename: './data', autoload: true });
  const item1 = {
    name: 'name1',
    location: 'address1',
    price: 5,
    collateral: 150,
  };
  const item2 = {
    name: 'name2',
    location: 'address2',
    price: 10,
    collateral: 300,
  };
  const item3 = {
    name: 'name3',
    location: 'address3',
    price: 2,
    collateral: 400,
  };
  // DELETE OLD DATA FOR DEV PURPOSES
  await db.remove({}, { multi: true });
  // Insert new data
  await db.insert([item1, item2, item3]);
  const dbItems = await db.count({});
  console.log(`Database loaded with ${dbItems} items`);
}

itemsRouter
// Get all items
.get('/', async (req, res, next) => {
  const items = await db.find({});
  return res.json(items);
})

// Create a new item
.post('/', async (req, res, next) => {
  // Store the parameters from the request
  const { name, location, price, collateral } = req.body;
  // Insert and return the new item
  const added = await db.insert({ name, location, price, collateral });
  return res.json(added);
})

// Get a single item
.get('/:itemID', async (req, res, next) => {
  // Store the parameters from the request
  const itemID = req.params.itemID;
  const item = await db.findOne({ _id: itemID });
  return res.json(item);
})

// Update a single item
.patch('/:itemID', async (req, res, next) => {
  // Store the parameters from the request
  const itemID = req.params.itemID;
  const { name, location, price, collateral } = req.body;
  const params = { name, location, price, collateral };
  // Remove extra parametres that don't need replacement
  Object.keys(params).forEach((key) => (params[key] === undefined) && delete params[key]);
  // Return dummy data
  const oldItem = await db.findOne({ _id: itemID });
  const updateCount = await db.update({ _id: itemID }, { $set: params });
  const newItem = await db.findOne({ _id: itemID });
  return res.json(newItem);
})

// Delete a single item
.delete('/:itemID', async (req, res, next) => {
  const itemID = req.params.itemID;
  // Return dummy data
  const oldItem = await db.findOne({ _id: itemID });
  const removeCount = await db.remove({ _id: itemID }, {});
  return res.json(oldItem);
});

// Load database
console.log('Loading database');
loadDatabase();
export default itemsRouter;
