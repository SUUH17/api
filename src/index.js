import Sequelize from 'sequelize';
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import itemsRouter from './items/index';
import authRouter from './auth/index';
import borrowRouter from './borrow/index';
import imagesRouter from './images/index';
import models from './models';

const sequelize = new Sequelize('db', null, null, {
  dialect: 'sqlite',
  storage: './data.sqlite',
  logging: false,
});

const db = models(sequelize);

function initDB() {
  Promise.all(Object.keys(db).map( key => db[key].sync({ force: false }))).then(() => {
//    db.User.create({ name: 'allu', password: 'moi', cordaPort: '10007', partyName: 'C=GB,L=London,O=PartyA' });
//    db.User.create({ name: 'henkru', password: 'moi', cordaPort: '10010', partyName: 'C=US,L=New York,O=PartyB' });
  });
}

initDB();

const port = 5001;
const server = express();

server
.use(cors({ origin: 'http://localhost:8080', credentials: true }))
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
