const express = require("express");
const auth = require("../auth");

// obtiene las notificaciones no leidas
function list(queryParameter) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  let sql = `SELECT T1.*,CONCAT(T2.lastname," ",T2.name) username FROM cayetano.record_logs T1 LEFT JOIN users T2 ON T1.userId = T2.id`;
  if (queryParameter.type && queryParameter.type == "loginlist") {
    sql += ` WHERE T1.type = 'new-login' GROUP BY T1.userId `;
  } else {
    sql += ` WHERE T1.type != 'new-login' `;
  }
  sql += `ORDER BY T1.id DESC `;
  if (queryParameter.type && queryParameter.type == "loginlist") {
    sql += ` LIMIT 50 `;
  } else {
    sql += ` LIMIT 250 `;
  }
  return query(sql, []);
}

module.exports = {
  list,
};
