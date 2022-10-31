var moment = require("moment");

function insertNew(amount, imputation_date, car_id, credit_id, callback) {
  mysqli.query(
    "INSERT IGNORE INTO insurances ( amount,imputationDate,carID) VALUES (?,?,?)",
    [amount, imputation_date, car_id],
    (err, rows) => {
      let month = moment(imputation_date).format("MM");
      let year = moment(imputation_date).format("YYYY");

      console.log("month", month);
      console.log("year", year);
      console.log("credit_id", credit_id);

      mysqli.query(
        "UPDATE credits_items SET safe = ? WHERE MONTH(period) = ? AND YEAR(period) = ? AND credit_id = ?",
        [amount, month, year, credit_id],
        (err, rows) => {
          if (err && err.message) {
            console.log(err.message);
          }
          mysqli.query(
            "SELECT * FROM insurances WHERE carID = ? ORDER BY id DESC LIMIT 1",
            [car_id],
            (err, rows) => {
              if (rows.length > 0) {
                return callback(err, rows[0]);
              } else {
                return callback(err, []);
              }
            }
          );
        }
      );
    }
  );
}

function getList(carid, callback) {
  let sql =
    "SELECT * FROM insurances WHERE carID = ? AND status = 1 ORDER BY imputationDate DESC";
  console.log(sql);

  mysqli.query(sql, [carid], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function getInfo(insuranceid, callback) {
  let sql = "SELECT * FROM insurances WHERE id = ? LIMIT 1";
  console.log(sql);

  mysqli.query(sql, [insuranceid], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows[0];
    }
    return callback(err, response);
  });
}

function deleteInsurance(id, callback) {
  let sql = "UPDATE insurances SET status = 0 WHERE id = ?";
  mysqli.query(sql, [id], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      mysqli.query(
        "SELECT * FROM insurances WHERE id = ?",
        [id],
        (err, rows) => {
          if (rows) {
            return callback(err, response);
          }
        }
      );
    }
  });
}

function updateInsurance(amount, id, callback) {
  let sql = "UPDATE insurances SET amount = ? WHERE id = ?";
  mysqli.query(sql, [amount, id], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      mysqli.query(
        "SELECT * FROM insurances WHERE id = ?",
        [id],
        (err, rows) => {
          if (rows) {
            response = rows[0];
          }
          if (rows) {
            return callback(err, response);
          }
        }
      );
    }
  });
}

function getAll(callback) {
  let sql = `SELECT
      T1.id,
      T1.amount,
      T1.imputationDate,
      T2.brand,
      T2.model,
      T2.year,
      T2.domain
    FROM
      insurances T1 
      LEFT JOIN cars T2 ON T1.carID = T2.id
    ORDER BY
      imputationDate DESC`;
  console.log(sql);

  mysqli.query(sql, [], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

module.exports = {
  insertNew,
  getAll,
  getList,
  deleteInsurance,
  getInfo,
  updateInsurance,
};
