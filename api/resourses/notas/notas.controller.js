const moment = require("moment");
const { resolve } = require("path");


async function getAllNotas(creditID) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);

  const sql = `SELECT * FROM notas left join users on notas.userID = users.id WHERE creditID = ? ORDER BY fecha DESC;`;
  const notas = await query(sql, [creditID]);

  if (notas) {
    return notas;
  } else {
    return [];
  }
}


//agregar notas con post
async function addNotas({
  userID, creditID, notas, USER_ID, fecha
}) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  try {
    const sql = `INSERT INTO notas (userID, creditID, notas, fecha) VALUES(?, ?, ?, now())`;
    const postNotas = await query(sql, [userID, creditID, notas, USER_ID, fecha]);
    if (postNotas) {
      return  postNotas;
    } else {
      return util.callbackify(null, []);
    }
  } catch (err) {
    console.log("error al insertar datos" , err)
    return {
      message: ["error al insertar datos"]
    }
  }
}

async function deleteNotas(id) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  try {
    const sql = `DELETE FROM notas WHERE id = ?;`;
    const deleteNotas = await query(sql, [id]);
    if (deleteNotas) {
      return deleteNotas;
    } else {
      return null
    }
  }catch (err){
    console.log("error al borrar los datos", err)
    return {
      message:["error al borrar los datos."]
    }
  }
}

async function editNotas(id,notas) {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  try{
    const sql = `UPDATE notas SET notas = ? WHERE id = ?`;
    const editNotes = await query(sql, [notas, id]);
    if(editNotes){
      return editNotes;
    }else{
      return null
    }
  }catch(err) {
    console.log("error al editar los datos.")
  }
}

module.exports = { 
  getAllNotas,
  addNotas,
  deleteNotas,
  editNotas
}
