const express = require("express");
const cajaController = require('./caja.controller');
const cajaRouter = express.Router();
const auth = require("../auth");
const jwt_decode = require("jwt-decode");

cajaRouter.get("/caja", auth.required, function (req, res) {
  cajaController.getCajas()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.send(500).json({ response: "Error el obtener los datos" });
    })
});

cajaRouter.get("/resumecaja", auth.required, function (req, res) {
  cajaController.getResumeCaja()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err)
      res.send(500).json({ response: "Error al obtener datos del /resumecaja" });
    })
});

cajaRouter.put("/updatecaja", auth.required, function (req, res) {
  const caja_id = req.body.caja_id
  console.log(caja_id);

  cajaController.updateCaja(caja_id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.send(500).json({ response: "Error al updatear los datos en el contolador" })
    })
});

cajaRouter.post("/repocisiondiaria", auth.required, function (req, res) {
  const amount = req.body.amount;
  const decoded = jwt_decode(auth.getToken(req));
  const USER_ID = decoded.id;
  cajaController.repocisionCajaDiaria(
    amount,
    USER_ID,
  )
    .then((data) => {
      console.log(data);
      res.json(data).status(200);
    })
    .catch((err) => {
      res.send(500).json({ response: "Error al obtener los datos en el controlador" });
    });
});


module.exports = cajaRouter;
