import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import itemsRouter from './items/index';

const port = 5001;
const server = express();

server
.use(cors())
.use(bodyParser.json())
.disable('x-powered-by')
.get('/', (req, res, next) => {
  return res.json({ status: 'up' });
})
.use('/items', itemsRouter)
.listen(port, () => {
  console.log(`Server running on ${port}`);
});