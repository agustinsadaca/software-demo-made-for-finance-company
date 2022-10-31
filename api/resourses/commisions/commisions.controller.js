const express = require("express");

function getList(callback) {
  let sql = "SELECT * FROM commisions where status=1 ORDER BY useLocation";
  console.log(sql);

  mysqli.query(sql, (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function create(
  name,
  percentage,
  useLocation,
  capitalizationForm,
  minCommision,
  maxCommision,
  callback
) {
  mysqli.query(
    "INSERT INTO commisions ( name, percentage,useLocation, capitalizationForm, minCommision, maxCommision) VALUES (?,?,?,?,?,?)",
    [
      name,
      percentage,
      useLocation,
      capitalizationForm,
      minCommision,
      maxCommision,
    ],
    (err, result, rows) => {
      if (err) {
        console.log(err);
      }
      mysqli.query(
        "SELECT * FROM commisions where id =?",
        [result.insertId],
        (err, rows) => {
          if (rows.length > 0) {
            return callback(null, rows[0]);
          } else {
            return callback(err);
          }
        }
      );
    }
  );
}

function getInfo(fields = Array, id, callback) {
  var selectFields = "*";
  if (fields.length > 0) {
    selectFields = fields.join();
  }
  mysqli.query("SELECT * FROM commisions WHERE id = ?", [id], (err, rows) => {
    if (rows.length > 0) {
      return callback(err, rows[0]);
    } else {
      return callback(err, []);
    }
  });
}

function updateItem(fields, id, callback) {
  // actualizar el status a 0 y crear uno nuevo con estos valores
  const sql = `UPDATE commisions SET status=0 WHERE id=?`;
  mysqli.query(sql, [id], (err, rows) => {
    // se actualizó el registro, se inserta otro igual pero con los valores actualizados
    if (err) {
      return callback(err, null);
    }
    const insert = `INSERT INTO commisions
                    (name, percentage, useLocation, capitalizationForm, minCommision, maxCommision, status)
                    VALUES(?, ?, ?, ?, ?, ?, 1)`;
    mysqli.query(
      insert,
      [
        fields.name,
        fields.percentage,
        fields.useLocation,
        fields.capitalizationForm,
        fields.minCommision,
        fields.maxCommision,
      ],
      (err, result, rows) => {
        if (err) {
          console.log(err);
          return callback(err, null);
        }
        // retorno el objeto recien creado
        mysqli.query(
          "SELECT * FROM commisions WHERE id = ?",
          [result.insertId],
          (err, rows) => {
            callback(null, rows[0]);
          }
        );
      }
    );
  });
}

function getCommisionByUseLocation(locationId) {
  return new Promise((resolve, reject) => {
    mysqli.query(
      "SELECT * FROM commisions WHERE useLocation = ? AND status=1",
      [locationId],
      (err, rows, fields) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      }
    );
  });
}

module.exports = {
  getList,
  create,
  getInfo,
  updateItem,
  getCommisionByUseLocation,
};
