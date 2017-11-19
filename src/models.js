import Sequelize from 'sequelize';

function models(sequelize) {
  const User = sequelize.define('User', {
    name: Sequelize.STRING,
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    password: Sequelize.STRING,
    cordaPort: Sequelize.STRING,
    partyName: Sequelize.STRING,
  });

  const Item = sequelize.define('Item', {
    name: Sequelize.STRING,
    location: Sequelize.STRING,
    price: Sequelize.FLOAT,
    collateral: Sequelize.FLOAT,
  });

  const Image = sequelize.define('Image', {
    data: Sequelize.BLOB('long'),
    mimetype: Sequelize.STRING,
  });

  const Loan = sequelize.define('Loan', {
    stateId: Sequelize.STRING,
    inProgress: Sequelize.BOOLEAN,
  });

  Item.belongsTo(User, { as: 'owner' });
  Item.belongsTo(Image, { as: 'image' });

  Loan.belongsTo(User, { as: 'borrower' });
  Loan.belongsTo(User, { as: 'borrowee' });
  Loan.belongsTo(Item, { as: 'item' });

  return { User, Item, Image, Loan };
}

export default models;
