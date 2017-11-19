import express from 'express';
import fetch from 'node-fetch';

async function transferMoni(amount) {
  // Request Init

  const timestamp = new Date().toISOString();
  let initOps = {
    amount: amount,
    subject: "rent",
    currency: "EUR",
    payerIban: "FI1958400720090508",
    valueDate: timestamp,
    receiverBic: "OKOYFIHH",
    receiverIban: "FI2350009421535899",
    receiverName: "Jere",
  };

  const headers = {
    'x-session-id': '98765',
    'x-api-key': 'mV7CfwG6oXQrQIF7A50tMLpfOLhW9cWP',
    'x-authorization': 'b6910384440ce06f495976f96a162e2ab1bafbb4',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const init = await fetch('https://sandbox.apis.op-palvelut.fi/v1/payments/initiate',
                           { method: 'POST', headers: headers, body: JSON.stringify(initOps) });
  const initJson = await init.json();
  if (initJson.message || initJson.fault)
    return false;

  const paymentId = initJson.paymentId;

  let confirmOps = {
    amount: amount,
    subject: "rent",
    currency: "EUR",
    payerIban: "FI1958400720090508",
    paymentId: paymentId,
    valueDate: timestamp,
    receiverBic: "OKOYFIHH",
    receiverIban: "FI2350009421535899",
    receiverName: "Jere",
  };

  const confirm = await fetch('https://sandbox.apis.op-palvelut.fi/v1/payments/confirm',
                              { method: 'POST', headers: headers, body: JSON.stringify(confirmOps) });
  const confirmJson = await confirm.json();
  console.log(confirmJson);
  if (confirmJson.message || confirmJson.fault)
    return false;

  return true;
}

function borrowRouter(db) {
  const router = express.Router();
  const CORDA_IP = process.env.CORDA_IP;
  console.log(`CORDA_IP = ${CORDA_IP}`);

  router
  .get('/', async (req, res, next) => {
    const loans = await db.Loan.findAll();
    return res.json(loans);
  })
  // Borrow item
  .post('/borrow/:itemId', async (req, res, next) => {
    const itemId = parseInt(req.params.itemId);
    const item = await db.Item.findOne({ where: { id: itemId }});

    if (!item)
      return res.status(404).json({'item': 'not found :D'});

    if (!req.cookies['session'])
      return res.status(401).json({'mee pois': '>D'});

    const user = await db.User.findOne({ where: {id: parseInt(req.cookies['session'])}});
    if (!user)
       return res.status(401).json({'user': 'not found'});

    if (await db.Loan.findOne({ where: { inProgress: true, itemId }}))
      return res.status(401).json({ 'status': 'item already borrowed' })

    const addr = `http://${CORDA_IP}:${user.get('cordaPort')}/api/v1/borrow`;

    console.log(item);
    const borrowee = await db.User.findOne({ where: { id: item.get('ownerId') }});
    if (!borrowee)
      return res.status(609).json({ 'vittu': 'aha' });

    const payload = {
                       item: item.get('id'),
                       time: parseInt(Date.now() / 1000) + 60 * 60 * 24,
                       hourPrice: item.get('price'),
                       contractId: 0,
                       partyName: borrowee.get('partyName'),
    };

    const payloadStr = Object.keys(payload).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(payload[k])).join('&');

    // send payload to addr
    try {
      const resp = await fetch(addr + '?' + payloadStr, { method: 'POST' })
      const json = await resp.json();
      const stateId = json.stateId;

      const newLoan = { borrowerId: user.get('id'), borroweeId: item.get('ownerId'), stateId, itemId, inProgress: true };
      await db.Loan.create(newLoan);
    } catch(err) {
      console.log(err);
      return res.status(500).json({ status: 'corda API not available' });
    }

    return res.json({'status': 'OK'});
  })
  // Return item
  .post('/return/:itemId', async (req, res, next) => {
    const itemId = parseInt(req.params.itemId);
    const item = await db.Item.findOne({ where: { id: itemId }});
    const userId = parseInt(req.cookies['session']);

    const borrowee = await db.User.findOne({ where: { id: userId }});
    if (!borrowee)
      return res.status(401).json({'user': 'not found'});

    const loan = await db.Loan.findOne({ where: { inProgress: true, borroweeId: borrowee.get('id'), itemId }});
    if (!loan)
      return res.status(404).json({ 'status': 'no matching loan found' });

    const addr = `http://${CORDA_IP}:${borrowee.cordaPort}/api/v1/return`;
    const payload = { state: loan.get('stateId') };
    const payloadStr = Object.keys(payload).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(payload[k])).join('&');

    try {
      const resp = await fetch(addr + '?' + payloadStr, { method: 'GET' });
      const json = await resp.json();
      const stateId = json.stateId;

      if (!(await transferMoni(100)))
        return res.json({ status: 'no moni' });

      await loan.updateAttributes({ inProgress: false });

      return res.json({ status: 'returned' });
    } catch(err) {
      console.log(err);
      return res.status(500).json({ status: 'failed to return' });
    }

  })

  return router;
}

export default borrowRouter;
