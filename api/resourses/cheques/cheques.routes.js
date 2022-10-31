const express = require('express');
const chequesController = require('./cheques.controller');
const chequesRouter = express.Router();
const auth = require('../auth');
const jwt_decode = require("jwt-decode");

chequesRouter.post('/createcheques', auth.required, function (req, res) {
  const fecha_emision = req.body.fecha_emision;
  const fecha_vencimientos = req.body.fecha_vencimientos;
  const amount = req.body.amount;
  const nroCheque = req.body.nroCheque;
  const descripcion = req.body.descripcion;
  const tipoFormaCobros = req.body.tipoFormaCobros;
  const decoded = jwt_decode(auth.getToken(req));
  const USER_ID = decoded.id;
  const tipo = req.body.tipo;
  const type = req.body.type;
  const account_id = req.body.account_id;

  chequesController.createCheques(
    fecha_emision,
    fecha_vencimientos,

    amount,
    nroCheque,
    descripcion,
    tipoFormaCobros,
    USER_ID,
    tipo,
    type,
    account_id
  )
    .then((data) => {
      console.log(data);
      res.json(data).status(200);
    })
    .catch((err) => {
      console.log(err);
      res.send(500).json({ response: "Error al obtener los datos" });
    });
});
chequesRouter.post('/cobrocheque', auth.required, function (req, res) {
  const item = req.body.item
  const decoded = jwt_decode(auth.getToken(req));
  const USER_ID = decoded.id;

  chequesController.cobroCheques(
    item,
    USER_ID
  )
    .then((data) => {
      console.log(data);
      res.json(data).status(200);
    })
    .catch((err) => {
      console.log(err);
      res.send(500).json({ response: "Error al obtener los datos" });
    })
});

chequesRouter.get('/mostrarcheques', auth.required, function (err, res) {
  chequesController.getMostrarCheques()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.send(500).json({ response: "Error el obtener los datos" });
    })
});

module.exports = chequesRouter;