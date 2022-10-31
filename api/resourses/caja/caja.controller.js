const sendMail = require('../nodemailer/mail');


async function getCajas() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  let result;
  const sql = 'select * from caja';
  result = await query(sql, [])
  return result
};

//caja que muestra el resume diario de emprendo
/* -------------------------------------------------------------------------- */
/*                          funcion que envia los get                         */
/* -------------------------------------------------------------------------- */
async function getResumeCaja() {
  //resumen diario
  const efectivoDiario = await getEfectivoDiario();
  const brubankDiario = await getBrubankDiario();
  const santanderDiario = await getSantanderDiario();
  //resumen completo 
  const efectivoMayor = await getEfectivoMayor();
  const santanderMayor = await getSantanderMayor();
  const brubankMayor = await getBrubankMayor();
  return {
    efectivoDiario,
    brubankDiario,
    santanderDiario,
    totalResumeDiario: efectivoDiario + brubankDiario + santanderDiario,
    /////////////////
    efectivoMayor,
    santanderMayor,
    brubankMayor,
    totalResumeMayor: efectivoMayor + santanderMayor + brubankMayor,
  }
}



/* -------------------------------------------------------------------------- */
/*                              funcion con query                             */
/* -------------------------------------------------------------------------- */
async function getEfectivoDiario() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = "SELECT CASE WHEN SUM(amount) IS NULL THEN 0 ELSE SUM(amount) END efectivoDiarioQuery from cayetano.cash_flow where caja_id = '2' and operation_type not in ('pago_cuota_total') and account_id = '1';";
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].efectivoDiarioQuery
  } else {
    return 0
  }
}
async function getBrubankDiario() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = "select CASE WHEN SUM(amount) IS NULL THEN 0 ELSE SUM(amount) END brubankDiarioQuery from cayetano.cash_flow where caja_id = '2' and operation_type not in ('pago_cuota_total') and account_id = '5';";
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].brubankDiarioQuery
  } else {
    return 0
  }
}
async function getSantanderDiario() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = "select CASE WHEN SUM(amount) IS NULL THEN 0 ELSE SUM(amount) END santanderDiarioQuery from cayetano.cash_flow where caja_id = '2' and operation_type not in ('pago_cuota_total') and account_id = '8';";
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].santanderDiarioQuery
  } else {
    return 0
  }
}
async function getEfectivoMayor() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) efectivoMayorQuery FROM cash_flow WHERE caja_id = '1' 
  AND account_id = '1' and operation_type not in ('pago_cuota_total','ingreso_renovacion_diaria') 
  AND deleted_at IS NULL AND created_at BETWEEN '2022-10-06' AND NOW();`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].efectivoMayorQuery
  } else {
    return 0
  }
}
async function getSantanderMayor() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) santanderMayorQuery FROM cash_flow WHERE caja_id = '1' 
  AND account_id = '8' and operation_type not in ('pago_cuota_total') AND deleted_at IS NULL
  AND created_at BETWEEN '2022-10-06' AND NOW();`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].santanderMayorQuery
  } else {
    return 0
  }
}
async function getBrubankMayor() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const dataQuery = `SELECT SUM(amount) brubankMayorQuery FROM cash_flow WHERE caja_id = '1' 
  AND account_id = '5' and operation_type not in ('pago_cuota_total') AND deleted_at IS NULL
  AND created_at BETWEEN '2022-10-06' AND NOW();`;
  const result = await query(dataQuery, []);
  if (result) {
    return result[0].brubankMayorQuery
  } else {
    return 0
  }
}

/* -------------------------------------------------------------------------- */
/*        se updatea el caja id para que siempre se mande a caja mayor        */
/* -------------------------------------------------------------------------- */
async function updateCaja(caja_id) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  let getSql = `SELECT case when A.type	= 1 then "Ingreso" else "Egreso" end as tipoMovimiento,
  A.type,A.amount,date_format(A.created_at, "%d-%m-%Y") AS fecha,A.description,A.user,A.credit_id,A.investment_id,A.operation_type,A.credit_item_id,A.account_id,A.responsable_id,caja_id,B.name,responsable.lastname responsableName,
  CONCAT(users.lastname," ",users.name) username, CONCAT(creditUsers.lastname," ",creditUsers.name)  creditUser, cash_flow_accounts.name account_name, investments.investorID
FROM
  cayetano.cash_flow A
    LEFT JOIN cayetano.users ON A.user = users.id  
    LEFT JOIN cayetano.credits ON A.credit_id = credits.id
    LEFT JOIN cayetano.users responsable ON A.responsable_id = responsable.id
    LEFT JOIN cayetano.users creditUsers ON credits.clientID = creditUsers.id
    LEFT JOIN cayetano.cash_flow_accounts ON A.account_id = cash_flow_accounts.id
    LEFT JOIN cayetano.investments ON A.investment_id = investments.id
    JOIN cayetano.caja B ON A.caja_id = B.id
    where A.caja_id = 2 and operation_type not in ('ingreso_interes_cuotas', 'ingreso_capital_cuotas','ingreso_punitorios_cuotas','ingreso_seguro_cuotas')
ORDER BY
  A.created_at DESC`;
  const resultGetSql = await query(getSql, []);
  let getSqlTotalEfectivo = `SELECT case when A.type	= 1 then "Ingreso" else "Egreso" end as tipoMovimiento,
  A.type,sum(A.amount) as amount,date_format(A.created_at, "%d-%m-%Y") AS fecha,A.description,A.user,A.credit_id,A.investment_id,A.operation_type,A.credit_item_id,A.account_id,A.responsable_id,caja_id,B.name,responsable.lastname responsableName,
  CONCAT(users.lastname," ",users.name) username, creditUsers.lastname creditUser, cash_flow_accounts.name account_name, investments.investorID
FROM
  cayetano.cash_flow A
    LEFT JOIN cayetano.users ON A.user = users.id  
    LEFT JOIN cayetano.credits ON A.credit_id = credits.id
    LEFT JOIN cayetano.users responsable ON A.responsable_id = responsable.id
    LEFT JOIN cayetano.users creditUsers ON credits.clientID = creditUsers.id
    LEFT JOIN cayetano.cash_flow_accounts ON A.account_id = cash_flow_accounts.id
    LEFT JOIN cayetano.investments ON A.investment_id = investments.id
    JOIN cayetano.caja B ON A.caja_id = B.id
    where A.caja_id = 2 and account_id = 1 and operation_type not in ('ingreso_interes_cuotas', 'ingreso_capital_cuotas','ingreso_punitorios_cuotas','ingreso_seguro_cuotas')
ORDER BY
  A.created_at DESC;`;
  const resultGetSqlTotalEfectivo = await query(getSqlTotalEfectivo, [])
  const getSqlTotalSantander = `SELECT case when A.type	= 1 then "Ingreso" else "Egreso" end as tipoMovimiento,
  A.type,sum(A.amount) as amount,date_format(A.created_at, "%d-%m-%Y") AS fecha,A.description,A.user,A.credit_id,A.investment_id,A.operation_type,A.credit_item_id,A.account_id,A.responsable_id,caja_id,B.name,responsable.lastname responsableName,
  CONCAT(users.lastname," ",users.name) username, creditUsers.lastname creditUser, cash_flow_accounts.name account_name, investments.investorID
FROM
  cayetano.cash_flow A
    LEFT JOIN cayetano.users ON A.user = users.id  
    LEFT JOIN cayetano.credits ON A.credit_id = credits.id
    LEFT JOIN cayetano.users responsable ON A.responsable_id = responsable.id
    LEFT JOIN cayetano.users creditUsers ON credits.clientID = creditUsers.id
    LEFT JOIN cayetano.cash_flow_accounts ON A.account_id = cash_flow_accounts.id
    LEFT JOIN cayetano.investments ON A.investment_id = investments.id
    JOIN cayetano.caja B ON A.caja_id = B.id
    where A.caja_id = 2 and account_id = 8 and operation_type not in ('ingreso_interes_cuotas', 'ingreso_capital_cuotas','ingreso_punitorios_cuotas','ingreso_seguro_cuotas')
ORDER BY
  A.created_at DESC;`;
  const resultGetSqlTotalSantanderTotal = await query(getSqlTotalSantander, [])
  const getSqlTotalBrubank = `SELECT case when A.type	= 1 then "Ingreso" else "Egreso" end as tipoMovimiento,
  A.type,sum(A.amount) as amount,date_format(A.created_at, "%d-%m-%Y") AS fecha,A.description,A.user,A.credit_id,A.investment_id,A.operation_type,A.credit_item_id,A.account_id,A.responsable_id,caja_id,B.name,responsable.lastname responsableName,
  CONCAT(users.lastname," ",users.name) username, creditUsers.lastname creditUser, cash_flow_accounts.name account_name, investments.investorID
FROM
  cayetano.cash_flow A
    LEFT JOIN cayetano.users ON A.user = users.id  
    LEFT JOIN cayetano.credits ON A.credit_id = credits.id
    LEFT JOIN cayetano.users responsable ON A.responsable_id = responsable.id
    LEFT JOIN cayetano.users creditUsers ON credits.clientID = creditUsers.id
    LEFT JOIN cayetano.cash_flow_accounts ON A.account_id = cash_flow_accounts.id
    LEFT JOIN cayetano.investments ON A.investment_id = investments.id
    JOIN cayetano.caja B ON A.caja_id = B.id
    where A.caja_id = 2 and account_id = 5 and operation_type not in ('ingreso_interes_cuotas', 'ingreso_capital_cuotas','ingreso_punitorios_cuotas','ingreso_seguro_cuotas')
ORDER BY
  A.created_at DESC;`;
  const resultGetSqlTotalBrubank = await query(getSqlTotalBrubank, [])
  var mailOptions = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO.split(' '),
    subject: 'Cierre de caja diaria',
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
          <th>Totales</th>
          <th>Efectivo</th>
          <th>${resultGetSqlTotalEfectivo.map((item) => {return item.amount ? item.amount : 0})}</th>
          <th>Santander</th>
          <th>${resultGetSqlTotalSantanderTotal.map((item) => {return item.amount ? item.amount : 0})}</th>
          <th>brubank</th>
          <th>${resultGetSqlTotalBrubank.map((item) => {return item.amount ? item.amount : 0})}</th>
          <th></th>
        </tr>
        <br/>
        <br/>
        <tr>
          <th>Tipo movimiento</th>
          <th>Monto</th>
          <th>Fecha</th>
          <th>descripcion</th>
          <th>Operation_type</th>
          <th>Responsable</th>
          <th>Usuario</th>
          <th>Tipo de cuenta</th>
        </tr>
      </thead>
      <tbody>
      ${resultGetSql.map(function (items) {
    return `<tr>
          <td>${items.tipoMovimiento ? items.tipoMovimiento : " - " }</td>
          <td>${items.amount ? items.amount : 0}</td>
          <td>${items.fecha ? items.fecha : " - "}</td>
          <td>${items.description ? items.description : " - "}</td>
          <td>${items.operation_type ? items.operation_type : " - "}</td>
          <td>${items.responsable_id ? items.responsableName : " - "}</td>
          <td>${items.username ? items.username : " - "}</td>
          <td>${items.account_name ? items.account_name : " - "}</td>
        </tr>`
  })}
      </tbody>
    </table>
    </body>`
  mailOptions.html = html
  sendMail(mailOptions)
  if (resultGetSql.length > 0) {
    var sql = `UPDATE cash_flow SET caja_id = ? WHERE caja_id = 2;`;
  }
  let result = await query(sql, [caja_id]);
  let deleted_at = `UPDATE cash_flow SET deleted_at = now() WHERE operation_type = 'renovacion_caja_diaria' AND caja_id = '1';`;
  const resultDeleted_at = await query(deleted_at, []);
  console.log(mailOptions.html)
  return {
    result,
    resultGetSql,
    resultDeleted_at,
  }
};

/* -------------------------------------------------------------------------- */
/*     se crea un post para actualizar las repocisiones de la caja diaria     */
/* -------------------------------------------------------------------------- */

async function repocisionCajaDiaria(amount, USER_ID) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  let insertlog = `INSERT INTO cash_flow (type,amount,created_at,description,user,operation_type,account_id,caja_id) VALUES (2,?,NOW(),'Egreso por renovacion caja diaria',?,'renovacion_caja_diaria',1,1);`;
  const result = await query(insertlog, [amount - amount * 2, USER_ID]);
  // result.then(function (result) { console.log(result)}).catch(function (err) { throw err; });
  console.log("resul", result);
  let insertlog2 = `INSERT INTO cash_flow (type,amount,created_at,description,user,operation_type,account_id,caja_id) VALUES (1,?,NOW(),'Ingreso por renovacion caja diaria',?,'ingreso_renovacion_diaria',1,2);`;
  const result2 = await query(insertlog2, [amount, USER_ID])
  return {
    result,
    result2
  };
};

module.exports = {
  getCajas,
  getResumeCaja,
  updateCaja,
  repocisionCajaDiaria,
};