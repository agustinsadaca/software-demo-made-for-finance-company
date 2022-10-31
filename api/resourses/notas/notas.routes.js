const express = require("express");
const notasController = require("./notas.controller");
const jwt_decode = require("jwt-decode");
const auth = require("../auth");

const notasRoutes = express.Router();

notasRoutes.get("/getnotas/:creditID", auth.required, async (req, res) => {
  const creditID = req.params.creditID
  const getNotas = await notasController.getAllNotas(creditID);
  res.json(getNotas);
});

notasRoutes.post("/addnotas", auth.required, async (req, res) => {
  const decoded = jwt_decode(auth.getToken(req));
  const USER_ID = decoded.id;

  const postNotas = {
    userID: req.body.userID,
    creditID: req.body.creditID,
    notas: req.body.notas,
    fecha: req.body.fecha,
    USER_ID
  };
  notasController
  .addNotas(postNotas)
  .then((data) => {
    res.json(data)
  })
  .catch((err) => {
    console.log(err);
    res.send(500).json({ response : "esto no funciona"})
  });
});

notasRoutes.delete("/deletenotas", auth.required, async (req, res) => {
  const decoded = jwt_decode(auth.getToken(req));
  const USER_ID = decoded.id;

  const deleteNotas = await notasController.deleteNotas();
  res.json(deleteNotas);
})

notasRoutes.put("/editnotas", auth.required, async (req,res) => {
  const decoded = jwt_decode(auth.getToken(req));
  const USER_ID = decoded.id;
  const {id,notas} = req.body

  const editNotas = await notasController.editNotas(id,notas)
  res.json(editNotas)
})



module.exports = notasRoutes;