/* eslint-disable no-loop-func */
const moment = require("moment");
const paymentsController = require("../payments/payments.controller");
var commonFormulas = require("../common/formulas");

function create(
  clientid,
  carID,
  budget,
  primera_cuota,
  otorgamiento,
  prenda_file,
  USER_ID,
  account_id,
  caja_id,
  callback
) {
  mysqli.query(
    "SELECT * FROM budget WHERE id = ? LIMIT 1",
    [budget],
    (err, rows) => {
      if (rows.length > 0) {
        const credit_amount = rows[0].amount;
        const user = mysqli.query(
          "INSERT IGNORE INTO credits (clientID,carID,budget,primera_cuota,otorgamiento,prenda_file,credit_amount) VALUES (?,?,?,?,?,?,?)",
          [
            clientid,
            carID,
            budget,
            primera_cuota,
            otorgamiento,
            prenda_file,
            credit_amount,
          ],
          (err, rows) => {
            mysqli.query(
              "SELECT * FROM credits WHERE clientID = ? AND status > 0 ORDER BY id DESC",
              [clientid],
              (err, rows) => {
                if (rows.length > 0) {
                  // INSERTAMOS EL INGRESO DE DINERO A LA CAJA TYPE=1 PARA INGRESOS, TYPE=2 PARA EGRESOS
                  mysqli.query(
                    "INSERT INTO cash_flow (type,amount,created_at,description,user,credit_id,operation_type,account_id,caja_id) VALUES (2,?,NOW(),'Egreso por Crédito Otorgado',?,?,'egreso_credito_otorgado',?,?)",
                    [credit_amount - credit_amount * 2, USER_ID, rows[0].id, account_id, caja_id],
                    (err, rows) => { }
                  );

                  return callback(err, rows[0]);
                } else {
                  return callback(err, []);
                }
              }
            );
          }
        );
      }
    }
  );
}

function getCsv(callback) {
  let sql = `SELECT 
  B.id,
      C.lastname,
      C.name,
      C.phone,
      D.brand,
      D.model,
      A.period,
      A.amount,
      A.safe,
      A.punitorios,
      (A.amount + A.safe + A.punitorios) AS total,
      A.payed,
      B.additionalInfo,
      GROUP_CONCAT(concat_ws(' ', E.fecha, E.notas) SEPARATOR ' , ')
      
  FROM
      cayetano.credits_items A
          INNER JOIN
      cayetano.credits B ON A.credit_id = B.id
          INNER JOIN
      cayetano.users C ON B.clientID = C.id
          INNER JOIN
      cayetano.cars D ON B.carID = D.id
          INNER JOIN
      cayetano.notas E ON A.credit_id = E.creditID
  WHERE
      B.status = 1
          AND B.state IN ('4') IS NOT TRUE group by A.id;`;
  mysqli.query(sql, [], (err, rows) => {
    var response = []
    if(rows) {
      response = rows
    }
    return callback(err, response)
  })
}

function setAsFinished(creditid, userid, reason, callback) {
  let sql = `UPDATE credits SET status = 2 WHERE id = ?`;
  mysqli.query(sql, [creditid], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
      let sql = `INSERT INTO record_logs (type,userId,description,createdAt,reason,credit_id) VALUES ('finish-credit',?,?,NOW(),'finish-credit-button',?)`;
      mysqli.query(sql, [userid, reason, creditid], (err2, rows2) => {
        return callback(err, response);
      });
    }
  });
}

function updateCredit({ additional_info, creditid }, callback) {
  console.log(additional_info);
  let sql = `UPDATE credits SET additionalInfo = ? WHERE id = ?`;
  mysqli.query(sql, [additional_info, creditid], (err, rows) => {
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function createState(state, callback) {
  let sql = `INSERT INTO credit_states (name) VALUES (?)`;
  mysqli.query(sql, [state], (err, rows) => {
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function updateState(state, credit_id, callback) {
  let sql = `UPDATE credits SET state = ? WHERE id = ?`;
  mysqli.query(sql, [state, credit_id], (err, rows) => {
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

async function deleteCredit(creditid, user_id, callback) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const insertLog = `INSERT INTO record_logs (type,userId,createdAt,affectedId,credit_id) VALUES ('deleted-credit',?,NOW(),?,?)`;
  await query(insertLog, [user_id, creditid, creditid]);

  let sql = `UPDATE credits SET status = 0 WHERE id = ?`;
  const deleteCreditResult = await query(sql, [creditid]);

  if (deleteCreditResult) {
    let updateCashFlow = `UPDATE cash_flow SET deleted_at = NOW() WHERE credit_id = ?`;
    const updateCashFlowResult = await query(updateCashFlow, [creditid]);
  }

  return deleteCreditResult;
}

function getCreditAddresses(creditid, callback) {
  let sql = `SELECT
	T3.address,
	T3.number,
	T3.department,
	T3.type
FROM
	credits T1
	INNER JOIN budget T2 ON T1.budget = T2.id
	INNER JOIN address T3 ON T2.id = T3.budget
	WHERE T1.id = ?
	GROUP BY T3.id`;
  mysqli.query(sql, [creditid], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function getFinishedLog(creditid, callback) {
  let sql = `SELECT record_logs.*,CONCAT(users.lastname," ",users.name) userName FROM record_logs LEFT JOIN users ON record_logs.userId = users.id WHERE credit_id = ? AND record_logs.type = 'finish-credit' ORDER BY id DESC LIMIT 1`;
  mysqli.query(sql, [creditid], (err, rows) => {
    var response = {};
    if (rows) {
      response = rows[0];
    }
    return callback(err, response);
  });
}

function getStateList(callback) {
  let sql = `SELECT * FROM credit_states`;
  mysqli.query(sql, [], (err, rows) => {
    var response = {};
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function getCreditCars(creditid, callback) {
  let sql = `SELECT
	T2.brand,
	T2.model,
	T2.year,
	T2.domain,
	T2.details
FROM
	credits T1
	INNER JOIN cars T2 ON T1.carID = T2.id
	WHERE T1.id = ? LIMIT 1`;
  mysqli.query(sql, [creditid], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows[0];
    }
    return callback(err, response);
  });
}

function getInfo(creditid, callback) {
  let sql = `SELECT
              T1.id creditid,
              T1.status creditStatus,
              T1.carID,
              T1.clientID clientid,
              T1.additionalInfo,
              T1.state internalState,
              T4.id,
              T2.amount,
              DATE(T4.period) period,
              T4.amount cuota,
              T4.payed pagado,
              T4.safe seguro,
              COALESCE(SUM(T8.amount),0) punitorios,
              T8.days_past,
              CASE WHEN T4.period <= DATE(NOW())
              	THEN
              		((T4.safe + COALESCE(SUM(T8.amount),0) + T4.amount) - T4.payed)
              	ELSE 0
              	END deuda,
                T4.intereses,
            T4.saldo,
            T4.capital
            FROM
              credits T1
              INNER JOIN budget T2 ON T1.budget = T2.id
              LEFT JOIN credits_items T4 ON T1.id = T4.credit_id
              LEFT JOIN punitorios T8 ON T1.id = T8.credit_id AND T4.period = T8.period
            WHERE T1.id = ?
            GROUP BY T4.period`;
  mysqli.query(sql, [creditid], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function getCashFlow(creditid, callback) {
  let sql = `SELECT SUM(amount) pagado, credit_item_id, operation_type,description FROM cayetano.cash_flow WHERE credit_id = ? AND credit_item_id > 0 AND deleted_at IS NULL GROUP BY operation_type,credit_item_id`;
  mysqli.query(sql, [creditid], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function getCashFlowPerCreditItem(creditidid, callback) {
  let sql = `SELECT SUM(amount) pagado, credit_item_id, operation_type,description FROM cash_flow WHERE credit_item_id = ? AND credit_item_id > 0 AND deleted_at IS NULL GROUP BY operation_type,credit_item_id`;
  mysqli.query(sql, [creditidid], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

async function updatePrenda(
  address,
  number,
  department,
  workaddress,
  worknumber,
  workdepartment,
  carbrand,
  carmodel,
  caryear,
  domain,
  details,
  clientid,
  budget,
  user_id,
  credit_id,
  callback
) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const insertLog = `INSERT INTO record_logs (type,userId,createdAt,affectedId,credit_id) VALUES ('updated-prenda',?,NOW(),?,?)`;
  await query(insertLog, [user_id, budget, credit_id]);

  let sql = `UPDATE address SET address = ?,number = ?, department = ? WHERE clientID = ? AND budget = ? AND type = 1`;
  mysqli.query(
    sql,
    [address, number, department, clientid, budget],
    (err, rows) => {
      let sql2 = `UPDATE address SET address = ?,number = ?, department = ? WHERE clientID = ? AND budget = ? AND type = 2`;
      mysqli.query(
        sql2,
        [workaddress, worknumber, workdepartment, clientid, budget],
        (err, rows) => {
          let sql3 = `UPDATE cars SET brand = ?,model = ?, year = ?, details = ? WHERE clientID = ? AND domain = ?`;
          mysqli.query(
            sql3,
            [carbrand, carmodel, caryear, details, clientid, domain],
            (err, rows) => {
              var response = [];
              if (rows) {
                response = rows;
              }
              return callback(err, response);
            }
          );
        }
      );
    }
  );
}

function getPrendaInfo(creditid, callback) {
  console.log(creditid);
  let sql = `SELECT
      T1.id creditid,
      T1.clientId clientid,
      T2.id budget_id,
      T2.amount,
      T3.model,
      T3.brand,
      T3.year,
      T3.domain,
      T3.details,
      T4.address,
      T4.number,
      T4.department,
      T4.type,
          T5.originalname,
          T5.path,
          T5.url
    FROM
      credits T1
      INNER JOIN budget T2 ON T1.budget = T2.id
      INNER JOIN cars T3 ON T1.carID = T3.id
      INNER JOIN address T4 ON T1.budget = T4.budget
          LEFT JOIN files T5 ON T5.id = T1.prenda_file
    WHERE
      T1.id = ?`;
  mysqli.query(sql, [creditid], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function getClientList(clientid, callback) {
  let sql = `SELECT
      T1.id,
      T1.status,
      T2.amount,
      T2.cuotas,
      T3.brand,
      T3.model,
      T3.year
    FROM
      credits T1
      INNER JOIN budget T2 ON T1.budget = T2.id
      INNER JOIN cars T3 ON T1.carID = T3.id
    WHERE
      T1.clientID = ? AND T1.status > 0`;
  mysqli.query(sql, [clientid], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function getList(callback) {
  let sql = `SELECT 
  A.id,
  A.clientID,
  A.amount,
  A.cuotas,
  A.brand,
  model,
  year,
  name,
  lastname,
  phone,
  status,
  additionalInfo,
  state,
  (SUM(seguro) + (CASE
      WHEN SUM(punitorios) IS NULL THEN 0
      ELSE SUM(punitorios)
  END) + SUM(cuota)) - SUM(pagado) deuda,
  case when state in('2', '5', '6') then NULL
  else B.dias end as dias
FROM
  (SELECT 
      T1.status,
          T1.id,
          T1.clientID,
          T1.additionalInfo,
          T2.amount,
          T2.cuotas,
          T3.brand,
          T3.model,
          T3.year,
          T5.name,
          T5.lastname,
          T4.period,
          T5.phone,
          T1.state,
          CASE
              WHEN T4.period <= DATE(NOW()) THEN T4.amount
              ELSE 0
          END cuota,
          CASE
              WHEN T4.period <= DATE(NOW()) THEN T4.payed
              ELSE 0
          END pagado,
          CASE
              WHEN T4.period <= DATE(NOW()) THEN T4.safe
              ELSE 0
          END seguro,
          CASE
              WHEN T4.period <= DATE(NOW()) THEN T8.amount
              ELSE 0
          END punitorios
  FROM
      cayetano.credits T1
  INNER JOIN cayetano.budget T2 ON T1.budget = T2.id
  INNER JOIN cayetano.cars T3 ON T1.carID = T3.id
  INNER JOIN cayetano.users T5 ON T1.clientID = T5.id
  LEFT JOIN cayetano.credits_items T4 ON T1.id = T4.credit_id
  LEFT JOIN cayetano.punitorios T8 ON T1.id = T8.credit_id
      AND T4.period = T8.period) A
      LEFT JOIN
  (SELECT 
      SUM(A.deudas) AS deudas, A.dias, A.id
  FROM
      (SELECT 
      c.id,
          c.clientID,
          ci.period,
          (ci.amount + safe + (CASE
              WHEN SUM(p.amount) THEN SUM(p.amount)
              ELSE 0
          END)) - (CASE
              WHEN ci.payed THEN ci.payed
              ELSE 0
          END) AS deudas,
          DATEDIFF(NOW(), ci.period) AS dias
  FROM
      cayetano.punitorios p
  RIGHT JOIN cayetano.credits_items ci ON ci.credit_id = p.credit_id
      AND MONTH(p.period) = MONTH(ci.period)
      AND YEAR(p.period) = YEAR(ci.period)
  INNER JOIN cayetano.credits c ON c.id = ci.credit_id
  WHERE
      1 AND ci.period < NOW()
  GROUP BY ci.credit_id , ci.period , c.id
  HAVING deudas > 0
  ORDER BY c.clientID , ci.period) A
  GROUP BY A.id) AS B ON A.id = B.id
WHERE
  A.status > 0
GROUP BY A.id
ORDER BY status ASC, state,dias DESC;
  `;
  mysqli.query(sql, (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

async function createItems(
  totalamount,
  cuotas,
  creditID,
  primera_cuota,
  budgetInfo,
  callback
) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);

  let cuotaamount = totalamount / cuotas;
  let otorgamiento;
  if (budgetInfo.budgetGastosOtorgamientoValue) {
    otorgamiento = budgetInfo.budgetGastosOtorgamientoValue / cuotas;
  }

  let capitalBaseMasOtorgamiento = +budgetInfo.budgetAmount;

  if (budgetInfo.gastos_otorgamiento === 1) {
    capitalBaseMasOtorgamiento += +budgetInfo.budgetGastosOtorgamientoValue;
  }

  const rateValue = commonFormulas.rate(
    cuotas,
    cuotaamount,
    capitalBaseMasOtorgamiento
  );
  const generarCuotasArray = commonFormulas.generarCuotas(
    cuotas,
    cuotaamount,
    capitalBaseMasOtorgamiento,
    rateValue
  );

  try {
    if (generarCuotasArray.length > 0) {
      let totalIntereses = 0;
      let totalCapital = 0;

      for (let index = 0; index < generarCuotasArray.length; index++) {
        const cuotaElement = generarCuotasArray[index];
        totalCapital += cuotaElement.capital;
        totalIntereses += cuotaElement.interes;
        let newDate = moment(primera_cuota)
          .add(index, "months")
          .format("YYYY-MM-DD");

        let sql =
          "INSERT IGNORE INTO credits_items (period,capital,otorgamiento,intereses,amount,credit_id,saldo) VALUES (?,?,?,?,?,?,?)";
        await query(sql, [
          newDate,
          cuotaElement.capital,
          otorgamiento,
          cuotaElement.interes,
          cuotaamount,
          creditID,
          cuotaElement.saldo,
        ]);
      }
      let sql2 = "UPDATE credits SET intereses = ?, capital = ? WHERE id = ?";
      await query(sql2, [totalIntereses, totalCapital, creditID]);
    }

    let sql =
      "SELECT * FROM credits_items WHERE credit_id = ? ORDER BY id DESC";
    const creditItems = await query(sql, [creditID]);

    if (creditItems.length > 0) {
      return callback(null, creditItems[0]);
    } else {
      return callback(null, []);
    }
  } catch (err) {
    return callback(err, []);
  }
}

async function updateInsurance(domain, amount, callback) {
  //console.log("DOMAIN", domain);
  //console.log("AMOUNT", amount);
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  console.log(domain, amount);
  let sql = `UPDATE credits_items
      SET safe = ? WHERE credit_id = (
        SELECT
          T2.id credit_id
        FROM
          cars T1
          INNER JOIN credits T2 ON T1.id = T2.carID
      WHERE
        T1.domain = ? LIMIT 1) AND MONTH(period) = MONTH(NOW()) AND YEAR(period) = YEAR(NOW()) `;
  const seguros = await query(sql, [amount, domain]);
  return seguros;
}

async function importCredit(data) {
  //1 - Insertar o actualizar cliente
  const cliente = await saveClient(data);
  if (cliente.id) {
    // 2 cargar el auto
    const car = await saveCar(data, cliente.id);
    if (car.id) {
      // 3 - Generar el budget con los datos del credito para ese cliente
      const budget = await genBudget(data, cliente.id);
      if (budget.id) {
        // 4 - Cargar la direccion del cliente para ese credito y ese cliente
        const address = await saveAdress(data, cliente.id, budget.id);
        // 5 - Insertar en credits y credit_items los valores del budget
        const credit = await saveCredit(data, cliente.id, budget.id, car.id);
        return credit;
      } else {
        throw new Error(budget.messages[0]);
      }
    } else {
      console.log(car);
      // error no se puedo insertar el auto no se puede continuar
      throw new Error(car.messages[0]);
    }
  } else {
    // error no se puedo insertar el cliente por alguna loca razon
    throw new Error(cliente.messages[0]);
  }
}

async function getPaymentCoupons(creditId) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const sql = `SELECT
                T2.cuotas,
                T4.period,
                T4.amount cuota
              FROM
                credits T1
                LEFT JOIN budget T2 ON T1.budget = T2.id
                LEFT JOIN credits_items T4 ON T1.id = T4.credit_id
              WHERE
                T4.credit_id = ?
              ORDER BY T4.period`;
  const coupons = await query(sql, [creditId]);
  return coupons;
}

async function getPrintInfo(creditID) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const clientDataQuery = ` SELECT CONCAT(u.lastname,' ', u.name )  apellido_nombre
                           , u.dni
                           , u.phone telefono
                           , u.email
                           , u.id userId
                           FROM users u
                           INNER JOIN credits c on c.clientID = u.id
                           WHERE c.id = ?`;
  const client = await query(clientDataQuery, [creditID]);
  const carDataQuery = `SELECT brand car_brand
                      , model car_model
                      , year car_year
                      , domain car_domain
                      , details car_details
                      FROM cars c
                      INNER JOIN users u on u.id = c.clientID
                      INNER JOIN credits cr on cr.clientID = u.id
                      WHERE cr.id=?`;
  const car = await query(carDataQuery, [creditID]);
  const budgetDataQuery = `SELECT b.amount budget_amount
                      , b.cuotas budget_cuotas
                      , b.commision budget_commision
                      , b.otorgamiento budget_otorgamiento
                      , b.primera_cuota budget_primera_cuota
                      , b.id budgetId
                      FROM budget b
                      INNER JOIN credits c ON c.budget = b.id
                      WHERE c.id=?`;
  const budget = await query(budgetDataQuery, [creditID]);
  const addressesQuery = `SELECT * FROM address WHERE clientID = ? AND budget = ?;`;
  const addresses = await query(addressesQuery, [
    client[0].userId,
    budget[0].budgetId,
  ]);
  const statusDataQuery = `SELECT
                          T1.id creditid,
                          T1.carID,
                          T1.clientId clientid,
                          T1.additionalInfo additionaldata,
                          T4.id,
                          T2.amount,
                          T4.period,
                          T4.amount cuota,
                          T4.safe,
                          T4.payed pagado,
                          T4.safe seguro,
                          SUM(T8.amount) punitorios,
                          CASE WHEN T4.period <= DATE(NOW())
                          	THEN
                          		(T4.safe +
                          		(CASE WHEN SUM(T8.amount) IS NULL THEN 0 ELSE SUM(T8.amount) END) +
                          		T4.amount) - T4.payed
                          	ELSE 0
                          	END deuda
                        FROM
                          credits T1
                          LEFT JOIN budget T2 ON T1.budget = T2.id
                          LEFT JOIN credits_items T4 ON T1.id = T4.credit_id
                          LEFT JOIN punitorios T8 ON T1.id = T8.credit_id AND T4.period = T8.period
                        WHERE
                          T4.credit_id = ?
                        GROUP BY
                          T4.period`;
  const status = await query(statusDataQuery, [creditID]);
  return {
    client: client[0],
    car: car[0],
    budget: budget[0],
    status: status,
    addresses,
  };
}

async function saveClient(data) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const messages = [];
  let error = 0;
  //verifico si el cliente existe, en este daria un error de constraint si esta duplicado
  try {
    const sql =
      "INSERT INTO users (name,lastname,type,email,password,dni,privileges,phone,probability) VALUES (?,?,?,?,?,?,?,?,?)";
    const bind = [
      data.cliente_nombre,
      data.cliente_apellido,
      4, // cliente
      data.cliente_email,
      "",
      data.cliente_dni,
      "",
      data.cliente_telefono,
      data.cliente_probabilidad === "Alta" ? "high" : "low",
    ];
    const client = await query(sql, bind);
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      console.log("Error el cliente ya existe");
      messages.push("el cliente ya existía");
    } else {
      error = 1;
      console.log("Error al insertar el cliente", err);
      messages.push("Error inesperado al insertar el cliente");
    }
  }
  // en este punto deberia ser capaz de encontrar el usuario ya sea por que se inserto o bien fallo pr que existia
  if (error === 0) {
    const user = await query("SELECT id FROM users WHERE dni =?", [
      data.cliente_dni,
    ]);
    return {
      id: user[0].id,
      messages: messages,
    };
  } else {
    return {
      id: null,
      messages: messages,
    };
  }
}
async function saveCar(data, clientID) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const messages = [];
  let error = 0;
  //verifico si el cliente existe, en este daria un error de constraint si esta duplicado
  try {
    const sql =
      "INSERT INTO cars (brand, model, `year`, `domain`, details, clientID) VALUES(?, ?, ?, ?, ?, ?)";
    const bind = [
      data.vehiculo_marca,
      data.vehiculo_modelo,
      data.vehiculo_ano,
      data.vehiculo_patente,
      data.vehiculo_detalles,
      clientID,
    ];
    const car = await query(sql, bind);
  } catch (err) {
    error = 1;
    if (err && err.code === "ER_DUP_ENTRY") {
      console.log("Error el vehículo ya existe");
      messages.push(
        `Error el vehículo ya existe patente ${data.vehiculo_patente}`
      );
    } else {
      console.log("Error al insertar el vehículo", err);
      messages.push("Error inesperado al insertar el vehículo");
    }
  }
  // en este punto deberia ser capaz de encontrar el usuario ya sea por que se inserto o bien fallo pr que existia
  if (error === 0) {
    const car = await query("SELECT id FROM cars WHERE `domain` = ?", [
      data.vehiculo_patente,
    ]);
    return {
      id: car[0].id,
      messages: messages,
    };
  } else {
    return {
      id: null,
      messages: messages,
    };
  }
}
async function genBudget(data, clientID) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  //verifico si el cliente existe, en este daria un error de constraint si esta duplicado
  try {
    const sql =
      "INSERT INTO budget (clientid, amount, imported, cuotas, total, granTotal, commision, otorgamiento, primera_cuota) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const comision =
      formatNumber(data.monto_final) - formatNumber(data.monto_sin_impuestos);

    const bind = [
      clientID,
      formatNumber(data.monto_sin_impuestos),
      1,
      formatNumber(data.cuotas),
      formatNumber(data.monto_sin_impuestos), // total
      formatNumber(data.monto_final),
      comision,
      data.fecha_otorgamiento,
      data.fecha_primera_cuota,
    ];
    const budget = await query(sql, bind);
    return {
      id: budget.insertId,
      messages: [],
    };
  } catch (err) {
    console.log("Error al insertar el presupuesto", err);
    return {
      id: null,
      messages: ["Error inesperado al insertar el presupuesto"],
    };
  }
}
async function saveAdress(data, clientID, budgetID) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  //verifico si el cliente existe, en este daria un error de constraint si esta duplicado
  try {
    const sql =
      "INSERT INTO address (address, `number`, department, `type`, clientID, budget) VALUES(?, ?, ?, ?, ?, ?)";
    const bind1 = [
      data.direccion,
      data.direccion_numero,
      data.direccion_localidad,
      1,
      clientID,
      budgetID,
    ];
    const bind2 = [
      data.direccion_laboral,
      data.direccion_laboral_numero,
      data.direccion_laboral_localidad,
      2,
      clientID,
      budgetID,
    ];
    const address1 = await query(sql, bind1);
    const address2 = await query(sql, bind2);
    return true;
  } catch (err) {
    console.log("Error al insertar direccion", err);
    return {
      id: null,
      messages: ["Error inesperado al insertar direccion"],
    };
  }
}
async function saveCredit(data, clientID, budgetID, carID) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  //verifico si el cliente existe, en este daria un error de constraint si esta duplicado
  try {
    const sql =
      "INSERT INTO credits(clientID, carID, amount, status, budget, otorgamiento, primera_cuota, prenda_file,tasa_credito) VALUES(?,?,?,?,?,?,?, 0,?)";
    const bind = [
      clientID,
      carID,
      null,
      1,
      budgetID,
      data.fecha_otorgamiento,
      data.fecha_primera_cuota,
      data.tasa,
    ];
    const credit = await query(sql, bind);
    const valorCuota =
      formatNumber(data.monto_final) / formatNumber(data.cuotas);

    console.log(`SEGURO ${data.seguro}`);

    const safe = data.seguro ? formatNumber(data.seguro) : 0;
    const promises = [];

    //console.log(data);
    //console.log(formatNumber(data.cuotas));
    //console.log(formatNumber(data.monto_final));
    //console.log(valorCuota);

    const rateValue = commonFormulas.rate(
      formatNumber(data.cuotas),
      valorCuota,
      formatNumber(data.monto_sin_impuestos)
    );

    //console.log(`rateValue = ${rateValue}`);

    const generarCuotasArray = commonFormulas.generarCuotas(
      formatNumber(data.cuotas),
      valorCuota,
      formatNumber(data.monto_sin_impuestos),
      rateValue
    );

    //console.log(generarCuotasArray);

    let totalCapital = 0;
    let totalIntereses = 0;

    for (let i = 0; i < Number(data.cuotas); i++) {
      promises.push(
        new Promise((resolve) => {
          const fechaCuota = moment(data.fecha_primera_cuota, "YYYY-MM-DD")
            .add(i, "months")
            .format("YYYY-MM-DD");

          const cuotaElement = generarCuotasArray[i];
          let interes = generarCuotasArray[i].interes;
          let saldo = generarCuotasArray[i].saldo;
          let capital = generarCuotasArray[i].capital;

          totalCapital += cuotaElement.capital;
          totalIntereses += cuotaElement.interes;

          resolve(
            query(
              "INSERT INTO credits_items (period,capital,intereses, amount, safe, credit_id, payed, saldo) VALUES(? ,? ,?, ?, ?, ?, 0, ?)",
              [
                fechaCuota,
                capital,
                interes,
                valorCuota,
                safe,
                credit.insertId,
                saldo,
              ]
            )
          );
        })
      );
    }

    let sql2 = "UPDATE credits SET intereses = ?, capital = ? WHERE id = ?";
    await query(sql2, [totalIntereses, totalCapital, credit.insertId]);

    if (data.pagado && +data.pagado > 0) {
      const payments = await paymentsController.insertPayment(
        data.pagado,
        data.fecha_pago,
        credit.insertId,
        clientID
      );
    }
    return Promise.all(promises).then((values) => {
      return values;
    });
  } catch (err) {
    console.log("Error al insertar el presupuesto", err);
    return {
      id: null,
      messages: ["Error inesperado al insertar el presupuesto"],
    };
  }
}
function formatNumber(num) {
  if (num.includes(",")) {
    const replaced = num.replace(/\./g, "");
    return Number(replaced.replace(/\,/g, "."));
  } else {
    return Number(num);
  }
}

module.exports = {
  create,
  getCsv,
  getInfo,
  getList,
  getClientList,
  getPrendaInfo,
  updatePrenda,
  createItems,
  updateInsurance,
  importCredit,
  getPrintInfo,
  getPaymentCoupons,
  getCreditAddresses,
  getCreditCars,
  deleteCredit,
  setAsFinished,
  updateCredit,
  getFinishedLog,
  createState,
  getStateList,
  updateState,
  getCashFlow,
  getCashFlowPerCreditItem,
};
