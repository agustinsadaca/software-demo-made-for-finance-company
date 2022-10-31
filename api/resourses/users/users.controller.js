const jwt = require("jsonwebtoken");
const secret = require("../../../config").secret;

function login(email, password, callback) {
  mysqli.query(
    "SELECT * FROM users WHERE email = ? AND password = ? AND paused = 0",
    [email, password],
    (err, rows) => {
      if (rows.length > 0) {
        const idUser = rows[0].id;
        let tokenData = rows[0];
        delete tokenData.token;
        delete tokenData.password;
        tokenData = JSON.stringify(tokenData);
        var token = jwt.sign(tokenData, secret);
        mysqli.query(
          "SELECT id, name, lastname, type, email, dni, phone, status, paused, privileges, probability FROM users WHERE id = ?",
          [idUser],
          (err, rows) => {
            let user = rows[0];
            user["token"] = token;
            mysqli.query(
              "INSERT INTO record_logs (type,userId,createdAt) VALUES ('new-login',?,NOW())",
              [idUser],
              (err2, rows2) => {
                return callback([], rows[0]);
              }
            );
          }
        );
      } else {
        return callback(err, []);
      }
    }
  );
}

function getUsers(type, callback) {
  let sql = `SELECT
         u.id
        , u.name
        , u.lastname
        , u.token
        , u.type
        , u.paused
        , u.probability
        , ut.name userType
        , ut.privileges
        , CASE WHEN SUM(dias) THEN SUM(dias) ELSE 0 END dueDays
        FROM users u
        LEFT JOIN users_types ut ON u.type = ut.id
        LEFT JOIN (
        	SELECT
        	  c.clientID
        	, ci.period
        	, (ci.amount + safe
        		+ (CASE WHEN SUM(p.amount) THEN SUM(p.amount) ELSE 0 END)
        	  )	- (CASE WHEN ci.payed THEN ci.payed ELSE 0 END) as deuda
        	, DATEDIFF(now(), ci.period) as dias
        	FROM punitorios p
        	RIGHT JOIN credits_items ci ON ci.credit_id = p.credit_id
        		AND MONTH(p.period) = MONTH(ci.period)
        		AND YEAR (p.period) = YEAR(ci.period)
        	INNER JOIN credits c on c.id = ci.credit_id
        	WHERE 1
        	AND ci.period < now()
        	GROUP by ci.credit_id,ci.period order by c.clientID, ci.period
        ) as dd ON u.id = dd.clientID AND dd.deuda > 0`;
  if (type != "" && (type == "clientes" || type == "inversores")) {
    if (type == "clientes") {
      sql += " WHERE u.type = 4 AND u.status = 1";
    }
    if (type == "inversores") {
      sql += " WHERE u.type = 5 AND u.status = 1";
    }
  } else {
    sql += " WHERE u.type <> 4 AND u.status = 1";
  }
  sql += ` GROUP by u.id`;
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

async function createUser(
  name,
  lastname,
  type,
  email,
  password,
  dni,
  privileges,
  phone,
  probability,
  callback,


) {
  /**
      1 - si type 1 y 2 no se repetir el email y el (type 1 o 2)
      2 - si type 4 y 5 comprobar por contraint (dni y type)
    **/
  privileges = JSON.stringify(privileges);
  let valid = true; // asumo que es valido
  let message = null;
  console.log(Number(type));
  if (Number(type) === 1 || Number(type) === 2) {
    // validación 1
    // aca hay que fijarse si viene password y correo como requerido
    if (email && password) {
      valid = await isValidUser(email);
      message =
        valid === false ? `Ya existe un usuario con el email ${email}` : null;
    } else {
      valid = false;
      message = `faltan completar datos, email y password son requeridos`;
    }
  }
  if (valid === true) {
    // crear el usuario
    try {
      const user = await insertuser([
        name,
        lastname,
        type,
        email,
        password,
        dni,
        privileges,
        phone,
        probability,
      ]);
      callback(null, user);
    } catch (e) {
      console.error(e);
      callback({ response: e }, null);
    }
  } else {
    if (valid === false) {
      return callback({ response: message }, null);
    } else {
      return callback(
        { response: `Ocurrio un error al validar, intente mas tarde` },
        null
      );
    }
  }
}

//ah modificar inversores
//ah modificar inversores

async function insertuser(user) {
  return new Promise((resolve, reject) => {
    mysqli.query(
      "INSERT INTO users (name,lastname,type,email,password,dni,privileges,phone, probability) VALUES (?,?,?,?,?,?,?,?,?)",
      user,
      (err, results, rows) => {
        if (err && err.code === "ER_DUP_ENTRY") {
          reject("Error el usuario ya existe");
        } else if (err) {
          reject("Error al insertar el usuario");
        } else {
          mysqli.query(
            "SELECT * FROM users WHERE id = ?",
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
async function isValidUser(email) {
  return new Promise((resolve, reject) => {
    mysqli.query(
      "SELECT 1 FROM users WHERE email = ? and type in(?)",
      [email, [1, 2]],
      (err, rows) => {
        if (err) {
          reject(err);
        }
        if (rows.length > 0) {
          resolve(false); // ya existe no es valido
        } else {
          resolve(true); //no existe, se puede crear
        }
      }
    );
  });
}

function getUserTypes(callback) {
  mysqli.query("SELECT * FROM users_types", (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function getUserPrivileges(callback) {
  mysqli.query("SELECT * FROM privileges", (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function getUser(userID) {
  return new Promise((resolve, reject) => {
    mysqli.query(
      `SELECT T1.id,
                T1.name,
                T1.lastname,
                T1.type,
                T1.email,
                T1.password,
                T1.token,
                T1.dni,
                T1.privileges,
                T1.phone,
                T1.status,
                T1.additionalInfo,
                T2.name usertype,
                T1.probability
        FROM users T1 LEFT JOIN users_types T2 ON T1.type = T2.ID WHERE T1.id = ?`,
      [userID],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      }
    );
  });
}

function deleteUser(id, callback) {
  mysqli.query(
    "UPDATE users SET status = 0 WHERE id = ?",
    [id],
    (err, rows) => {
      mysqli.query("SELECT * FROM users WHERE id = ?", [id], (err, rows) => {
        if (rows.length > 0) {
          return callback(err, rows[0]);
        } else {
          return callback(err, []);
        }
      });
    }
  );
}

function pauseUser(id, status, callback) {
  mysqli.query(
    "UPDATE users SET paused = ? WHERE id = ?",
    [status, id],
    (err, rows) => {
      mysqli.query("SELECT * FROM users WHERE id = ?", [id], (err, rows) => {
        if (rows.length > 0) {
          return callback(err, rows[0]);
        } else {
          return callback(err, []);
        }
      });
    }
  );
}

function recoverPassword(email, callback) {
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(process.env.SENDGRID_KEY);

  mysqli.query(
    "SELECT password FROM users WHERE email = ?",
    [email],
    (err, rows) => {
      if (rows.length > 0) {
        const msg = {
          to: email,
          from: "info@cayetanofinanciera.com",
          subject: "Su contraseña de Cayetano Financiera",
          text: "Tu contraseña es " + rows[0].password,
          html: "<strong>Tu contraseña es " + rows[0].password + "</strong>",
        };
        sgMail.send(msg, (error, result) => {
          console.log(error);
          if (error) {
            return callback(error, []);
          } else {
            return callback(result, rows);
          }
        });
      } else {
        return callback(err, []);
      }
    }
  );
}

function updateUser(fields, id, callback) {
  if (id && Number(id) > 0) {
    var updateValue = [];
    var sql = "UPDATE users SET ";
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
      mysqli.query("SELECT * FROM users WHERE id = ?", [id], (err, rows) => {
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
  login,
  getUsers,
  createUser,
  getUserTypes,
  getUserPrivileges,
  getUser,
  deleteUser,
  pauseUser,
  recoverPassword,
  updateUser,
};
