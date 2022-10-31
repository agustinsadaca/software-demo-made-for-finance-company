const { start } = require("repl");
async function getCaja() {
  const totalcajaDiaria = await getTotalCajaDiaria()
  return (
    totalcajaDiaria
  )
}

async function getMovements(start = "", end = "") {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  let result;
  console.log("START", start);
  if (start && end) {
    const sql = `SELECT
    cash_flow.*,
    CONCAT(users.lastname," ",users.name) username,
    CONCAT(creditUsers.lastname," ",creditUsers.name) credit_responsable,
      cash_flow_accounts.name account_name,
      investments.investorID
  FROM
    cash_flow 
      LEFT JOIN users ON cash_flow.user = users.id  
      LEFT JOIN credits ON cash_flow.credit_id = credits.id
      LEFT JOIN users creditUsers ON credits.clientID = creditUsers.id
      LEFT JOIN cash_flow_accounts ON cash_flow.account_id = cash_flow_accounts.id
      LEFT JOIN investments ON cash_flow.investment_id = investments.id
  WHERE cash_flow.created_at BETWEEN ? AND ? AND cash_flow.deleted_at IS NULL
  ORDER BY
    cash_flow.created_at DESC`;
    console.log(sql);
    result = await query(sql, [start, end]);
  } else {
    const sql = `SELECT
    cash_flow.*,
    CONCAT(users.lastname," ",users.name) username,
      creditUsers.lastname credit_responsable,
      cash_flow_accounts.name account_name
  FROM
    cash_flow 
      LEFT JOIN users ON cash_flow.user = users.id  
      LEFT JOIN credits ON cash_flow.credit_id = credits.id
      LEFT JOIN users creditUsers ON credits.clientID = creditUsers.id
      LEFT JOIN cash_flow_accounts ON cash_flow.account_id = cash_flow_accounts.id
      WHERE cash_flow.deleted_at IS NULL
  ORDER BY
    cash_flow.created_at DESC`;
    console.log(sql);
    result = await query(sql, []);
  }
  return result;
}

async function deleteCashFlow(id) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  let result;
  let sql = `UPDATE cash_flow SET deleted_at = NOW() WHERE id = ?`;
  result = await query(sql, [id]);
  return result;
}

async function getAccounts() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  let result;
  let sql = `SELECT * FROM cash_flow_accounts WHERE deleted_at IS NULL ORDER BY created_at DESC`;
  result = await query(sql, []);
  return result;
}

async function addAccount(name) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  let result;
  let sql = `INSERT INTO cash_flow_accounts (name,created_at) VALUES (?,NOW())`;
  result = await query(sql, [name]);
  return result;
}

async function deleteAccount(id) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  let result;
  let sql = `UPDATE cash_flow_accounts SET deleted_at = NOW() WHERE id = ?`;
  result = await query(sql, [id]);
  return result;
}

async function getTotal(start = "", end = "") {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  let result;
  let sql = `SELECT SUM(amount) total FROM cash_flow`;
  if (start && end) {
    sql += ` WHERE created_at BETWEEN ? AND ?`;
    result = await query(sql, [start, end]);
  } else {
    result = await query(sql, []);
  }
  return result[0];
}

async function getCreditListMovements(credit_id) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const sql = `SELECT * FROM cash_flow WHERE credit_id = ? AND used_in_payments = 0 AND amount < 0`;
  const result = await query(sql, [credit_id]);
  return result;
}


async function getTotalCajaDiaria() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const sql = `SELECT sum(amount) cajadiaria from cash_flow where description = 'Ingreso por pago de seguro de cuota';`;
  const result = await query(sql, [])
  return result;
}



async function add(
  type,
  amount,
  created_at,
  description,
  user,
  credit_id,
  operation_type,
  investment_id,
  account_id,
  responsable_id,
  caja_id
) {
  return new Promise((resolve, reject) => {
    if (type == 2 || type == 5) {
      amount = -Math.abs(amount);
    }

    if (credit_id == "") {
      credit_id = null;
    }
    if (investment_id == "") {
      investment_id = null;
    }
    if (account_id == "") {
      account_id = null;
    }
   if (responsable_id == "") {
     responsable_id = null;
   }

    mysqli.query(
      "INSERT INTO cash_flow (type, amount, created_at,description, user, credit_id, operation_type, investment_id,account_id,responsable_id,caja_id) VALUES(?, ?, now(),?,?,?,?,?,?,?,?)",
      [
        type,
        amount,
        /* created_at, */
        description,
        user,
        credit_id,
        operation_type,
        investment_id,
        account_id,
        responsable_id,
        caja_id
      ],
      
      (err, results, rows) => {
        if (err) {
          console.error(err);
          reject({ response: "Error al insertar movimiento" });
        } else {
          mysqli.query(
            "SELECT * FROM cash_flow WHERE id = ?",
            [results.insertId],
            (err, rows) => {
              resolve(rows[0]);
            }
          );
        }
      }
    );
  });
}

module.exports = {
  getMovements,
  add,
  getTotal,
  getCreditListMovements,
  getAccounts,
  addAccount,
  deleteAccount,
  deleteCashFlow,
  getCaja,
};
