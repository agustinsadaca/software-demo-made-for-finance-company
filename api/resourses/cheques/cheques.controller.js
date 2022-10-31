async function createCheques(
  fecha_emision,
  fecha_vencimientos,
  amount,
  nroCheque,
  descripcion,
  tipoFormaCobros,
  USER_ID,
  tipo,
  type,
  account_id,
) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  if (type === '1') {
    let sql = `INSERT INTO cheques 
      (emision, vencimiento, monto, numeroCheque, descripcion,formaCobro,created_at,user,tipo, typeMovement) 
      VALUES 
      (?,?,?,?,?,?, now(),?,?,?)`;
    var result = await query(sql, [
      fecha_emision,        //fechas
      fecha_vencimientos,   //fechas
      amount,
      nroCheque,
      descripcion,
      tipoFormaCobros,
      USER_ID,
      tipo,
      type
    ]);
  } else {
    let sql = `INSERT INTO cheques 
      (emision, vencimiento, monto, numeroCheque, descripcion,formaCobro,created_at,user,tipo, typeMovement) 
      VALUES 
      (?,?,?,?,?,?, now(),?,?,?)`;
    var result2 = await query(sql, [
      fecha_emision,        //fechas
      fecha_vencimientos,   //fechas
      amount - amount * 2,
      nroCheque,
      descripcion,
      tipoFormaCobros,
      USER_ID,
      tipo,
      type
    ]);
  }
  return {
    result,
    result2
  }
}
async function cobroCheques(
  item,
  USER_ID,
) {
  const util = require('util');
  const query = util.promisify(mysqli.query).bind(mysqli);
  const sql = `INSERT INTO cash_flow (type, amount, created_at, description, user, operation_type, account_id, caja_id) 
    VALUES 
    (?, ?, NOW(), 'Cobro de cheque', ?, 'cobro_cheque', ?,  1);`;

  const result = await query(sql, [item.typeMovement, item.monto, USER_ID, item.account_id]);
  let selectSqlId = `SELECT LAST_INSERT_ID() AS ultimoID;`;
  const resultSelectSqlId = await query(selectSqlId, []);
  let sql2 = `UPDATE cheques SET cobro = now(), cashflow_id = ? WHERE id = ?;`;

  const result2 = await query(sql2, [resultSelectSqlId[0].ultimoID, item.id]);
  return {
    result,
    result2
  }
}

async function getMostrarCheques() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  let sql = `SELECT * FROM cheques`;
  const result = await query(sql, []);

  return result;
}

async function cronCheques() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  let sql = `select * from cayetano.cheques where  date_sub(vencimiento, interval 2 day) = date(now());`;
  const result = await query(sql, []);
  var mailOptions = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO.split(' '),
    subject: 'Vencimientos Cheque',
    html: ''
  }
  html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
  </head>
  <body>
      <table class="u-full-width">
      <thead>
        <tr>
          <th>Fecha vencimiento</th>
          <th>Monto</th>
          <th>nro Cheque</th>
          <th>descripcion</th>
        </tr>
      </thead>
      <tbody>
      ${result.map(function (items) {
    return `<tr>
          <td>${items.vencimiento}</td>
          <td>${items.monto}</td>
          <td>${items.numeroCheque}</td>
          <td>${items.descripcion}</td>
        </tr>`
  })}
      </tbody>
    </table>
    </body>`
  mailOptions.html = html
  sendMail(mailOptions)
  return result;
}


module.exports = {
  cronCheques,
  getMostrarCheques,
  cobroCheques,
  createCheques
}