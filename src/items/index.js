import express from 'express';
import DataStore from 'nedb-promise';
const itemsRouter = express.Router();
let db;

async function loadDatabase() {
  db = new DataStore({ filename: './data', autoload: true });
  const item1 = {
    itemID: 0,
    name: 'name1',
    location: 'address1',
    price: 5,
    collateral: 150,
  };
  const item2 = {
    itemID: 1,
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
.post('/', (req, res, next) => {
  // Echo data
  const body = res.body;
  // Return dummy data
  return res.json({ ...item1, itemID: 1 });
})

// Get a single item
.get('/:itemID', async (req, res, next) => {
  const itemID = parseInt(req.params.itemID);
  const item = await db.findOne({ itemID });
  return res.json(item);
})

// Update a single item
.put('/:itemID', (req, res, next) => {
  const itemID = req.params.itemID;
  const body = res.body;
  // Return dummy data
  return res.json({ ...body, itemID });
})

// Delete a single item
.delete('/:itemID', (req, res, next) => {
  const itemID = req.params.itemID;
  // Return dummy data
  return res.json({ ...item1, itemID });
});

<<<<<<< 59865ecde1bf454acd5aaff885a0251da2743d31
export default itemsRouter;
=======
// Load database
console.log('Loading database');
loadDatabase();
export default itemsRouter;
>>>>>>> Add initial database integration
