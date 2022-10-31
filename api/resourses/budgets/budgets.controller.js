function getList(callback) {
  let sql = "SELECT * FROM budget";
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
  amount,
  imported,
  cuotas,
  total,
  granTotal,
  commision,
  clientid,
  otorgamiento,
  primera_cuota,
  gastos_otorgamiento,
  gastos_otorgamiento_value,
  callback
) {
  console.log("gastos_otorgamiento", gastos_otorgamiento);
  mysqli.query(
    "INSERT IGNORE INTO budget ( clientid, amount, imported, cuotas,total,granTotal,commision,otorgamiento,primera_cuota,gastos_otorgamiento,gastos_otorgamiento_value) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [
      clientid,
      amount,
      imported,
      cuotas,
      total,
      granTotal,
      commision,
      otorgamiento,
      primera_cuota,
      gastos_otorgamiento,
      gastos_otorgamiento_value,
    ],
    (err, rows) => {
      mysqli.query("SELECT * FROM budget ORDER BY id DESC", [], (err, rows) => {
        if (rows.length > 0) {
          return callback(err, rows[0]);
        } else {
          return callback(err, []);
        }
      });
    }
  );
}

function getInfo(fields = Array, id, callback) {
  var selectFields = "*";
  if (fields.length > 0) {
    selectFields = fields.join();
  }
  mysqli.query("SELECT * FROM budget WHERE id = ?", [id], (err, rows) => {
    if (rows.length > 0) {
      return callback(err, rows[0]);
    } else {
      return callback(err, []);
    }
  });
}

function getLastClientBudget(clientid, callback) {
  mysqli.query(
    "SELECT * FROM budget WHERE clientid = ? ORDER BY id DESC",
    [clientid],
    (err, rows) => {
      if (rows.length > 0) {
        return callback(err, rows[0]);
      } else {
        return callback(err, []);
      }
    }
  );
}

function updateItem(fields = Array, id, callback) {
  if (id && Number(id) > 0) {
    var mysqli = this.mysqli;

    var updateValue = [];
    var sql = "UPDATE budget SET ";
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
      mysqli.query("SELECT * FROM budget WHERE id = ?", [id], (err, rows) => {
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
}

module.exports = {
  getList,
  create,
  getInfo,
  getLastClientBudget,
  updateItem,
};
