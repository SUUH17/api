import cors from 'cors';
import express from 'express';
import DataStore from 'nedb-promise';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import itemsRouter from './items/index';
import authRouter from './auth/index';
import borrowRouter from './borrow/index';
import imagesRouter from './images/index';

const port = 5001;
const server = express();

let db = {
  items: new DataStore({ filename: './data', autoload: true }),
  users: new DataStore({ filename: './auth', autoload: true }),
  loans: new DataStore({ filename: './loans', autoload: true }),
  images: new DataStore({ filename: './images', autoload: true }),
};

server
.use(cors())
.use(bodyParser.json())
.disable('x-powered-by')
.use(cookieParser())
.use(fileUpload())
.get('/', (req, res, next) => {
  return res.json({ status: 'up' });
})
.use('/auth', authRouter(db))
.use('/items', itemsRouter(db))
.use('/loans', borrowRouter(db))
.use('/images', imagesRouter(db))
.listen(port, () => {
  console.log(`Server running on ${port}`);
});
