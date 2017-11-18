import express from 'express';

function imagesRouter(db) {
  const router = express.Router();
  router
  // Get all items
  .get('/', async (req, res, next) => {
    const images = await db.Image.findAll({ attributes: ['id', 'mimetype'] });
    return res.json(images);
  })

  // Create a new item
  .post('/', async (req, res, next) => {
    if (!req.files)
      return res.status(400).json({ status: 'no files uploaded' });

    const image = req.files.image;

    const added = await db.Image.create({ data: image.data, mimetype: image.mimetype });
    return res.json({ id: added.get('id') });
  })

  // Get a single item
  .get('/:imageId', async (req, res, next) => {
    // Store the parameters from the request
    const imageId = parseInt(req.params.imageId);
    const item = await db.Image.findOne({ where: { id: imageId }});

    if (!item)
      return res.status(404).json({ status: '404' });

    return res.set('Content-Type', 'image/jpeg')
             .set('Content-Length', item.get('data').length)
             .send(item.get('data'));
  })

  // Delete a single item
  .delete('/:imageId', async (req, res, next) => {
    const imageId = req.params.imageId;
    // Return dummy data
    const oldItem = await db.items.findOne({ _id: imageId });
    const removeCount = await db.items.remove({ _id: imageId }, {});
    return res.json(oldItem);
  });

  return router;
}

export default imagesRouter;
