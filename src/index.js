import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import itemsRouter from './items/index';
import authRouter from './auth/index';
import borrowRouter from './borrow/index';
import DataStore from 'nedb-promise';

const port = 5001;
const server = express();

let db = {
  items: new DataStore({ filename: './data', autoload: true }),
  users: new DataStore({ filename: './auth', autoload: true }),
  loans: new DataStore({ filename: './loans', autoload: true }),
};

server
.use(cors())
.use(bodyParser.json())
.disable('x-powered-by')
.use(cookieParser())
.get('/', (req, res, next) => {
  return res.json({ status: 'up' });
})
.use('/auth', authRouter(db))
.use('/items', itemsRouter(db))
.use('/borrow', borrowRouter(db))
.listen(port, () => {
  console.log(`Server running on ${port}`);
});
