const usersController = require("../users/users.controller");
const resumeController = require("../resume/resume.controller");
const moment = require("moment");

function createInvestment(investment, USER_ID, account_id, caja_id) {
  return new Promise((resolve, reject) => {
    mysqli.query(
      "INSERT INTO investments (investorID, amount, percentage, termID, period, ts) VALUES(?, ?, ?, ?, ?, ?)",
      [
        investment.investorID,
        investment.amount,
        investment.percentage,
        investment.termID,
        investment.period,
        investment.ts,
      ],
      (err, results, rows) => {
        if (err) {
          console.error(err);
          reject({ response: "Error al insertar inversión" });
        } else {
          mysqli.query(
            "SELECT * FROM investments WHERE id = ?",
            [results.insertId],
            (err, rows) => {
              // INSERTAMOS EL INGRESO DE DINERO A LA CAJA TYPE=1 PARA INGRESOS, TYPE=2 PARA EGRESOS
              mysqli.query(
                "INSERT INTO cash_flow (type,amount,created_at,description,user,investment_id,operation_type,account_id,caja_id) VALUES (1,?,?,'ingreso de dinero por nueva inversion',?,?,'inversion_nueva',?,?)",
                [investment.amount, investment.ts, USER_ID, results.insertId,account_id, caja_id],
                (err2, rows2) => {
                  resolve(rows[0]);
                }
              );
            }
          );
        }
      }
    );
  });
}

async function getAllInvestements() {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);

  const sql = `SELECT 
  T1.amount monto_inversion,
  T1.percentage porcentaje,
  T1.period cuotas,
  T1.ts fecha_inversion,
  T1.recapitalizar recapitaliza_automaticamente,
  T1.recapitalizacion_status recapitaliza,
  T2.name nombre,
  T2.lastname apellido,
  T2.email,
  T2.dni,
  T2.phone telefono,
  SUM(T3.amount) total_pagado
  FROM 
  cayetano.investments T1
  INNER JOIN cayetano.users T2 ON T1.investorID = T2.id
  LEFT JOIN cayetano.investments_payments T3 ON T1.id = T3.investmentID
  GROUP BY T1.id
  `;
  const investments = await query(sql, []);

  if (investments) {
    return investments;
  } else {
    return [];
  }
}

async function getInvestementInfo(investmentId) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);

  const sql = `SELECT * FROM investments WHERE id = ?`;
  const investment = await query(sql, [investmentId]);

  let withdrawAmmount,
    investment_amount = 0;
  let investmentPayments = [];

  if (investment) {
    investment_amount = investment[0].amount;
    const sql2 = `SELECT SUM(amount) withdrawAmmount FROM cayetano.cash_flow WHERE investment_id = ? AND type = 2 AND operation_type = 'retiro_inversion';`;
    const retirosInversion = await query(sql2, [investmentId]);
    if (retirosInversion) {
      withdrawAmmount = retirosInversion[0].withdrawAmmount;
    }

    const investmentPaymentsSql = `SELECT * FROM investments_payments WHERE investmentID = ?`;
    const investmentPayments = await query(investmentPaymentsSql, [
      investmentId,
    ]);

    let pagosRealizados = 0;

    const investmentPaymentsTotalSql = `SELECT SUM(amount) pagosRealizados FROM investments_payments WHERE investmentID = ?`;
    const investmentPaymentsTotal = await query(investmentPaymentsTotalSql, [
      investmentId,
    ]);
    if (investmentPaymentsTotal && investmentPaymentsTotal.length > 0) {
      pagosRealizados = investmentPaymentsTotal[0].pagosRealizados;
    }

    return {
      investment: investment[0],
      amount: investment_amount,
      withdrawAmmount: withdrawAmmount,
      payments: investmentPayments,
      totalPayments: pagosRealizados,
    };
  }
}

async function getRetiros(investment_id) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);

  let retirosTotal = 0;
  let saldo = 0;

  const sql1 = `SELECT amount FROM cayetano.investments WHERE id = ?;`;
  const montoInversionResult = await query(sql1, [investment_id]);

  const sql2 = `SELECT * FROM cash_flow WHERE investment_id = ? AND operation_type = 'retiro_inversion';`;
  const retirosInversionResult = await query(sql2, [investment_id]);

  const sql3 = `SELECT ABS(SUM(amount)) retirosTotal FROM cash_flow WHERE investment_id = ? AND operation_type = 'retiro_inversion';`;
  const retirosTotalResult = await query(sql3, [investment_id]);

  if (retirosTotalResult.length > 0) {
    retirosTotal = retirosTotalResult[0].retirosTotal;
  }

  if (montoInversionResult.length > 0) {
    saldo = montoInversionResult[0].amount - retirosTotal;
  }

  return {
    retiros: retirosInversionResult,
    retirosTotal: retirosTotal,
    saldo: saldo,
  };
}

function getPaymentsByInvestment(investmentId) {
  return new Promise((resolve, reject) => {
    mysqli.query(
      `SELECT * FROM investments_payments WHERE investmentID = ?;`,
      [investmentId],
      (err, rows) => {
        if (err) {
          console.error(err);
          reject({ response: "Error al leer los pagos de la inversion" });
        } else {
          resolve(rows);
        }
      }
    );
  });
}

function getRecapitalizaciones(investmentId) {
  return new Promise((resolve, reject) => {
    mysqli.query(
      `SELECT * FROM recapitalizaciones WHERE investment_id = ?;`,
      [investmentId],
      (err, rows) => {
        if (err) {
          console.error(err);
          reject({
            response: "Error al leer las recapitalizaciones de la inversion",
          });
        } else {
          resolve(rows);
        }
      }
    );
  });
}

function recapitalizar({ investmentid, prev_amount, new_amount, USER_ID }) {
  return new Promise((resolve, reject) => {
    mysqli.query(
      `INSERT INTO recapitalizaciones (investment_id,previous_amount,new_amount,user_id,created_at) VALUES (?,?,?,?,NOW());`,
      [investmentid, prev_amount, new_amount, USER_ID],
      (err, rows) => {
        if (err) {
          console.error(err);
          reject({ response: "Error al insertar recapitalizacion" });
        } else {
          mysqli.query(
            `UPDATE investments SET amount = ? WHERE id = ?;`,
            [new_amount, investmentid],
            (err2, rows2) => {
              if (err2) {
                console.error(err);
                reject({ response: "Error al actualizar valor" });
              } else {
                resolve(rows);
              }
            }
          );
        }
      }
    );
  });
}

function recapitalizar_auto({ investmentId, status, USER_ID }) {
  return new Promise((resolve, reject) => {
    mysqli.query(
      `UPDATE investments SET recapitalizar = ? WHERE id = ?;`,
      [!!status, investmentId],
      (err, rows) => {
        if (err) {
          console.error(err);
          reject({
            response: "Error al actualizar recapitalizacion automatica",
          });
        } else {
          resolve(rows);
        }
      }
    );
  });
}

function recapitalizar_status({ investmentId, status, USER_ID }) {
  return new Promise((resolve, reject) => {
    mysqli.query(
      `UPDATE investments SET recapitalizacion_status = ? WHERE id = ?;`,
      [!!status, investmentId],
      (err, rows) => {
        if (err) {
          console.error(err);
          reject({
            response: "Error al actualizar el estado de la recapitalizacion",
          });
        } else {
          resolve(rows);
        }
      }
    );
  });
}

function payInvestment(investment, USER_ID, account_id,caja_id) {
  return new Promise((resolve, reject) => {
    //ACA CHEQUEAMOS SI SE HA HECHO UNA RECAPITALIZACION, SI ES ASI NO DEBERIA PODER RECIBIR PAGOS
    mysqli.query(
      `SELECT * FROM cayetano.recapitalizaciones WHERE investment_id = ?`,
      [investment.investmentID],
      (errcheck, rowscheck) => {
        let tieneRecapitalizaciones = 0;
        if (rowscheck.length > 0) {
          tieneRecapitalizaciones = 1;
        }
        if (tieneRecapitalizaciones == 0) {
          mysqli.query(
            "SELECT * FROM investments_payments WHERE investmentID = ? ORDER BY period DESC LIMIT 1",
            [investment.investmentID],
            (err, rows) => {
              let lastperiod = 1;
              if (rows.length > 0) {
                lastperiod = +rows[0].period + 1;
              }

              mysqli.query(
                "INSERT INTO investments_payments (investmentID, amount, period) VALUES(?, ?, ?)",
                [investment.investmentID, investment.amount, lastperiod],
                (err, results, rows) => {
                  if (err) {
                    console.error(err);
                    reject({ response: "Error al insertar el pago" });
                  } else {
                    //INSERTAMOS EL EGRESO EN LA CAJA
                    mysqli.query(
                      "INSERT INTO cash_flow (type,amount,created_at,description,user,investment_id,operation_type,account_id,caja_id) VALUES (2,?,NOW(),'egreso de dinero por pago de inversion',?,?,'pago_inversion',?,?);",
                      [
                        investment.amount - investment.amount * 2,
                        USER_ID,
                        investment.investmentID,
                        account_id,
                        caja_id
                      ],
                      (err, results, rows) => {
                        mysqli.query(
                          "SELECT * FROM investments_payments WHERE id = ?",
                          [results.insertId],
                          (err, rows) => {
                            resolve(rows[0]);
                          }
                        );
                      }
                    );
                  }
                }
              );
            }
          );
        } else {
          reject({
            response:
              "No puede cargar pagos sobre inversiones con recapitalizaciones",
          });
        }
      }
    );
  });
}

async function getInvestmentsByInvestor(investorID) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const user = await usersController.getUser(investorID);
  const investmentsQuery = `SELECT
	T1.*,
	T2.name tasa
FROM
	investments T1 LEFT JOIN commisions T2 ON T1.termID = T2.id 
WHERE
	T1.investorID = ? ORDER BY T1.ts DESC`;
  const investments = await query(investmentsQuery, [investorID]);
  const investmentsListQuery = `SELECT * FROM  investments i WHERE  i.investorID = ? AND 
  DATE(NOW()) BETWEEN DATE_ADD(DATE(i.ts),INTERVAL (period - 1) MONTH) AND DATE_ADD(DATE(i.ts),INTERVAL (period) MONTH)
	`;
  const investmentsList = await query(investmentsListQuery, [investorID]);

  const compromiso30dias =
    await resumeController.getCommitment30DaysPerInvestments(investmentsList);

  const soloInteresesApagarEn30diasQuery = await query(
    `SELECT 
  *
FROM
  cayetano.investments
WHERE
  DATE_ADD(DATE(ts),INTERVAL (period) MONTH) > DATE(NOW())
AND DATE_ADD(DATE(ts),INTERVAL (period - 1) MONTH) > DATE(NOW())
      AND investorID = ?;`,
    [investorID]
  );

  // se le pasa true a la funcion para que traiga solamente intereses
  const soloInteresesApagarEn30dias =
    await resumeController.getCommitment30DaysPerInvestments(
      soloInteresesApagarEn30diasQuery,
      true
    );

  const paymentsQuery = `SELECT * FROM investments_payments where investmentID =?`;
  // por cada investment me traigo los pagos
  const loopInvestments = async (_) => {
    for (let index = 0; index < investments.length; index++) {
      const payments = await query(paymentsQuery, [investments[index].id]);
      investments[index]["payments"] = payments;
    }
  };
  await loopInvestments();
  return {
    user: user,
    investments: investments,
    compromiso30dias: compromiso30dias,
    soloInteresesApagarEn30dias,
  };
}

module.exports = {
  createInvestment,
  recapitalizar_auto,
  recapitalizar_status,
  getInvestmentsByInvestor,
  payInvestment,
  getInvestementInfo,
  getRetiros,
  getPaymentsByInvestment,
  recapitalizar,
  getRecapitalizaciones,
  getAllInvestements,
};
