import express from 'express';

function itemsRouter(db) {
  const router = express.Router();
  router
  // Get all items
  .get('/', async (req, res, next) => {
    const items = await db.Item.findAll({
      attributes: Object.keys(db.Item.attributes).concat([
        [db.sequelize.literal('(SELECT COUNT("Loans"."id") FROM "Loans" WHERE "Loans"."itemId" = "Item"."id" AND "Loans"."inProgress" = 1) = 0'), 'available']
      ])
    });

    return res.json(items);
  })

  // Create a new item
  .post('/', async (req, res, next) => {
    // Store the parameters from the request
    let { name, location, price, collateral, imageId } = req.body;
    if (!req.cookies['session'])
      return res.status(401).json({ status: 'no session' });

    const user = await db.User.findOne({ where: { id: parseInt(req.cookies['session']) }});
    if (!user)
      return res.status(401).json({ status: 'invalid user' });

    price = Number(price);
    collateral = Number(collateral);
    // Insert and return the new item
    const added = await db.Item.create({ name, location, price, collateral, imageId, ownerId: user.get('id') });
    return res.json(added);
  })

  // Get a single item
  .get('/:itemId', async (req, res, next) => {
    // Store the parameters from the request
    const itemId = parseInt(req.params.itemId);
    const item = await db.Item.findOne({ where: { id: itemId },
                                         attributes: Object.keys(db.Item.attributes).concat([
                                           [db.sequelize.literal('(SELECT COUNT("Loans"."id") FROM "Loans" WHERE "Loans"."itemId" = "Item"."id" AND "Loans"."inProgress" = 1) = 0'), 'available']
                                         ])
                                       });
    return res.json(item);
  })
/*
  // Update a single item
  .patch('/:itemId', async (req, res, next) => {
    // Store the parameters from the request
    const itemId = req.params.itemId;
    const { name, location, price, collateral } = req.body;
    const params = { name, location, price, collateral };
    // Remove extra parametres that don't need replacement
    Object.keys(params).forEach((key) => (params[key] === undefined) && delete params[key]);
    // Return dummy data
    const oldItem = await db.items.findOne({ _id: itemId });
    const updateCount = await db.items.update({ _id: itemId }, { $set: params });
    const newItem = await db.items.findOne({ _id: itemId });
    return res.json(newItem);
  })
*/
  // Delete a single item
  .delete('/:itemId', async (req, res, next) => {
    const itemId = parseInt(req.params.itemId);
    // Return dummy data
    const oldItem = await db.Item.findOne({ where: { id: itemId }});
    const removeCount = await db.items.remove({ _id: itemId }, {});
    return res.json(oldItem);
  });
  return router;
}

export default itemsRouter;
