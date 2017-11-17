import express from 'express'
const itemsRouter = express.Router()

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

itemsRouter

// Get all items
.get('/', (req, res, next) => {
  // Return dummy data
  return res.json([item1, item2]);
})

// Create a new item
.post('/', (req, res, next) => {
  // Echo data
  const body = res.body;
  console.log(`POST ITEM ${JSON.stringify(body, null, 2)}`);
  // Return dummy data
  return res.json({ ...item1, itemID: 1 });
})

// Get a single item
.get('/:itemID', (req, res, next) => {
  const itemID = req.params.itemID;
  // Return dummy data
  return res.json({ ...item1, itemID });
})

// Update a single item
.put('/:itemID', (req, res, next) => {
  const itemID = req.params.itemID;
  const body = res.body
  // Return dummy data
  return res.json({ ...body, itemID });
})

// Delete a single item
.delete('/:itemID', (req, res, next) => {
  const itemID = req.params.itemID;
  // Return dummy data
  return res.json({ ...item1, itemID });
});

export default itemsRouter;