import express from 'express';
import DataStore from 'nedb-promise';
const authRouter = express.Router();
let db;

async function loadDatabase() {
  db = new DataStore({ filename: './auth', autoload: true });
  const user1 = {
    userID: 0,
    name: 'allu',
    password: 'moi',
  };
  await db.insert([user1]);
  const dbItems = await db.count({});
  console.log(`Database loaded with ${dbItems} items`);
}

authRouter
// Get all users
.get('/', async (req, res, next) => {
  const users = await db.find({});
  return res.json(users);
})

// Login
.post('/login', async (req, res, next) => {
  console.log(req.body);
  if (typeof req.body.username !== 'string' || typeof req.body.password !== 'string')
    return res.status(400).json({'homo': ':DD'});

  const item = await db.findOne({ name: req.body.username, password: req.body.password });
  if (item) {
    return res.cookie('session', item._id, -1).json({'jes': 'onnistu'});
  } else {
    return res.status(401).json({'mee': 'pois'});
  }
})

// Logout
.post('/logout', (req, res, next) => {
  return res.clearCookie('session').json({'logged': 'out'});
})

// Load database
console.log('Loading database');
loadDatabase();
export default authRouter;
