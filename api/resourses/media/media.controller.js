function getMediaByCredit(creditid, callback) {
  let sql = `SELECT * FROM files WHERE credit_id = ? AND deleted_at IS NULL`;
  mysqli.query(sql, [creditid], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function deleteMedia(id, callback) {
  let sql = `UPDATE files SET deleted_at = NOW() WHERE id = ? `;
  mysqli.query(sql, [id], (err, rows) => {
    //si queremos imprimir el mensaje ponemos err.sqlMessage
    var response = [];
    if (rows) {
      response = rows;
    }
    return callback(err, response);
  });
}

function addFileToDb(file, s3Response, creditid, callback) {
  try {
    let originalname = file.originalname;
    let path = file.filename;
    let url = s3Response.Location;

    let sql = `INSERT INTO files (originalname,path,url,credit_id) VALUES (?,?,?,?) `;
    console.log(sql);
    mysqli.query(sql, [originalname, path, url, creditid], (err, rows) => {
      var response = [];
      if (rows) {
        response = rows;
      }
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getMediaByCredit,
  addFileToDb,
  deleteMedia,
};
