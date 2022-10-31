class Users {
  constructor(mysqli) {
    this.mysqli = mysqli;
  }

  getUsers(callback) {
    var mysqli = this.mysqli;
    mysqli.query("SELECT * FROM users", (err, rows) => {
      //si queremos imprimir el mensaje ponemos err.sqlMessage
      var response = [];
      if (rows) {
        response = rows;
      }
      return callback(err, response);
    });
  }

  getUser(fields = Array, id, callback) {
    var selectFields = "*";
    if (fields.length > 0) {
      selectFields = fields.join();
    }
    var mysqli = this.mysqli;
    mysqli.query(
      "SELECT " + selectFields + " FROM users WHERE id = ?",
      [id],
      (err, rows) => {
        if (rows.length > 0) {
          return callback(err, rows[0]);
        } else {
          return callback(err, []);
        }
      }
    );
  }

  login(email, password, callback) {
    var mysqli = this.mysqli;
    mysqli.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
      (err, rows) => {
        if (rows.length > 0) {
          let idUser = rows[0].id;
          let tokenData = rows[0];
          tokenData.token = "";
          tokenData = JSON.stringify(tokenData);
          var token = jwt.sign(tokenData, "cayetano2014");
          var fields = { token: token };
          this.updateUser(fields, idUser, function(err, result) {
            console.log(result);
            var updateToken = result;
            if (
              updateToken.hasOwnProperty("affectedRows") &&
              updateToken.affectedRows > 0
            ) {
              var getNewInfo = this.getUser([], idUser);
              console.log(getNewInfo);
            } else {
              return callback(err, []);
            }
          });
        } else {
          return callback(err, []);
        }
      }
    );
  }

  updateUser(fields = Array, id, callback) {
    if (id && Number(id) > 0) {
      var mysqli = this.mysqli;

      var updateValue = [];
      var sql = "UPDATE users SET ";
      for (const [key, value] of Object.entries(fields)) {
        sql += " " + key + " = ? ";
        updateValue.push(value);
      }
      sql += " WHERE id = ?";
      updateValue.push(id);

      mysqli.query(sql, updateValue, (err, rows) => {
        return callback(err, rows[0]);
      });
    } else {
      return callback(err, []);
    }
  }
}

module.exports = { Users };
