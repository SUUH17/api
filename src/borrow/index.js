import express from 'express';
import fetch from 'node-fetch';

function borrowRouter(db) {
  const router = express.Router();
  const CORDA_IP = '127.0.0.1';

  router
  // Borrow item
  .post('/:itemId', async (req, res, next) => {
    const itemId = req.params.itemId;
    const item = db.items.findOne({ _id: itemId })

    if (!item)
      return res.status(404).json({'item': 'not found :D'});

    if (!req.cookies['session'])
      return res.status(401).json({'mee pois': '>D'});

    const user = await db.users.findOne({'_id': req.cookies['session']});
    if (!user)
       return res.status(401).json({'user': 'not found'});

    const addr = `http://${CORDA_IP}:${user.cordaPort}`;

    const payload = {item: item._id, time: parseInt(Date.now()) + 60 * 60 * 24, hourPrice: item.price, contractId: 0, partyName: user.partyName};

    // send payload to addr
    try {
      const resp = await fetch(addr, { method: 'POST', body: Object.keys(payload).map((k) => k + '=' + payload[k]).join('&') })
    } catch(err) {
      return res.status(500).json({ status: 'corda API not available' });
    }

    const stateId = await resp.json().body.stateId;

    const newLoan = { borrowerId: user._id, borroweeId: item.ownerId, stateId, itemId };
    await db.loans.insert(newLoan);

    return res.json({'status': 'OK'});
  })

  return router;
}

export default borrowRouter;
