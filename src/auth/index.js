import express from 'express';

function authRouter(db) {
  const router = express.Router();
  router
  // Get all users
  .get('/', async (req, res, next) => {
    const users = await db.users.find({});
    return res.json(users);
  })

  // Login
  .post('/login', async (req, res, next) => {
    console.log(req.body);
    if (typeof req.body.username !== 'string' || typeof req.body.password !== 'string')
      return res.status(400).json({'homo': ':DD'});

    const item = await db.users.findOne({ name: req.body.username, password: req.body.password });
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

  return router;
}

export default authRouter;
