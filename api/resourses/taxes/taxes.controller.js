const express = require('express');

function getList(callback) {

    let sql = "SELECT * FROM taxes";
    console.log(sql);

    mysqli.query(sql, (err, rows) => {
      //si queremos imprimir el mensaje ponemos err.sqlMessage
      var response = [];
      if (rows) {
        response = rows;
      }
      return callback(err, response);
    });
};

function createTax(name, amount, percentual, quantity, imported, callback) {
    mysqli.query(
      "INSERT IGNORE INTO taxes ( name,amount,percentual,quantity,imported) VALUES (?,?,?,?,?)",
      [name, amount, percentual, quantity, imported],
      (err, rows) => {
        mysqli.query("SELECT * FROM taxes", [], (err, rows) => {
          if (rows.length > 0) {
            return callback(err, rows[0]);
          } else {
            return callback(err, []);
          }
        });
      }
    );
};

function getTax(fields = Array, id, callback) {
    var selectFields = "*";
    if (fields.length > 0) {
      selectFields = fields.join();
    }
    mysqli.query("SELECT * FROM taxes WHERE id = ?", [id], (err, rows) => {
      if (rows.length > 0) {
        return callback(err, rows[0]);
      } else {
        return callback(err, []);
      }
    });
};

function updateTax(fields = Array, id, callback) {
    if (id && Number(id) > 0) {
    
      var updateValue = [];
      var sql = "UPDATE taxes SET ";
      for (const [key, value] of Object.entries(fields)) {
        sql += " `" + key + "` = ?,";
        updateValue.push(value);
      }
      sql = sql.slice(0, -1);
      sql += " WHERE id = ?";
      updateValue.push(id);
      console.log(sql);
      mysqli.query(sql, updateValue, (err, rows) => {
        console.log(err);
        mysqli.query("SELECT * FROM taxes WHERE id = ?", [id], (err, rows) => {
          if (rows.length > 0) {
            return callback(err, rows[0]);
          } else {
            return callback(err, []);
          }
        });
      });
    } else {
      return callback(err, []);
    }
};

module.exports = {
    getList,
    createTax,
    getTax,
    updateTax
}