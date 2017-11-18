import express from 'express';

function imagesRouter(db) {
  const router = express.Router();
  router
  // Get all items
  .get('/', async (req, res, next) => {
    const images = await db.images.find({});
    return res.json(images);
  })

  // Create a new item
  .post('/', async (req, res, next) => {
    if (!req.files)
      return res.status(400).json({ status: 'no files uploaded' });

    const image = req.files.image;
    const base64 = image.data.toString('base64');

    const added = await db.images.insert({ base64 });
    return res.json({ _id: added._id });
  })

  // Get a single item
  .get('/:imageId', async (req, res, next) => {
    // Store the parameters from the request
    const imageId = req.params.imageId;
    const item = await db.images.findOne({ _id: imageId });
    const img = Buffer.from(item.base64, 'base64');

    return res.set('Content-Type', 'image/jpeg')
             .set('Content-Length', img.length)
             .send(Buffer.from(item.base64, 'base64'));
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
