import express from 'express';

function usersRouter(db) {
  const router = express.Router();
  router
  // Get all users
  .get('/', async (req, res, next) => {
    const users = await db.User.findAll();
    return res.json(users);
  })

  // Login
  .get('/:userId', async (req, res, next) => {
    const userId = parseInt(req.params.userId);

    const user = await db.User.findOne({ where: { id: userId }});
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({'status': '404'});
    }
  })

  return router;
}

export default usersRouter;
