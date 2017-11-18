import express from 'express';
import fetch from 'node-fetch';

function borrowRouter(db) {
  const router = express.Router();
  const CORDA_IP = '10.66.30.212';

  router
  .get('/', async (req, res, next) => {
    const loans = await db.loans.find({});
    return res.json(loans);
  })
  // Borrow item
  .post('/borrow/:itemId', async (req, res, next) => {
    const itemId = req.params.itemId;
    const item = await db.items.findOne({ _id: itemId });

    if (!item)
      return res.status(404).json({'item': 'not found :D'});

    if (!req.cookies['session'])
      return res.status(401).json({'mee pois': '>D'});

    const user = await db.users.findOne({'_id': req.cookies['session']});
    if (!user)
       return res.status(401).json({'user': 'not found'});

    if (await db.loans.findOne({ inProgress: true, itemId }))
      return res.status(401).json({ 'status': 'item already borrowed' })

    const addr = `http://${CORDA_IP}:${user.cordaPort}/api/v1/borrow`;

    console.log(item);
    const borrowee = await db.users.findOne({ '_id': item.ownerId });
    if (!borrowee)
      return res.status(609).json({ 'vittu': 'aha' });

    const payload = {item: item._id, time: parseInt(Date.now() / 1000) + 60 * 60 * 24, hourPrice: item.price, contractId: 0, partyName: borrowee.partyName};
    const payloadStr = Object.keys(payload).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(payload[k])).join('&');

    // send payload to addr
    try {
      const resp = await fetch(addr + '?' + payloadStr, { method: 'POST' })
      const json = await resp.json();
      const stateId = json.stateId;

      const newLoan = { borrowerId: user._id, borroweeId: item.ownerId, stateId, itemId, inProgress: true };
      await db.loans.insert(newLoan);
    } catch(err) {
      console.log(err);
      return res.status(500).json({ status: 'corda API not available' });
    }


    return res.json({'status': 'OK'});
  })
  .post('/return/:itemId', async (req, res, next) => {
    const itemId = req.params.itemId;
    const item = await db.items.findOne({ _id: itemId });

    const borrowee = await db.users.findOne({'_id': req.cookies['session']});
    if (!borrowee)
      return res.status(401).json({'user': 'not found'});

    const loan = await db.loans.findOne({ inProgress: true, borroweeId: borrowee._id, itemId });
    if (!loan)
      return res.status(404).json({ 'status': 'no matching loan found' });

    const addr = `http://${CORDA_IP}:${borrowee.cordaPort}/api/v1/return`;
    const payload = { state: loan.stateId };
    const payloadStr = Object.keys(payload).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(payload[k])).join('&');

    try {
      const resp = await fetch(addr + '?' + payloadStr, { method: 'GET' });
      const json = await resp.json();
      const stateId = json.stateId;

      await db.loans.update({ _id: loan._id }, { $set: { inProgress: false }}, {});

      return res.json({ status: 'returned' });
    } catch(err) {
      console.log(err);
      return res.status(500).json({ status: 'failed :D' });
    }

  })

  return router;
}

export default borrowRouter;
