const express = require("express");
const resumeController = require("./resume.controller");
const resumeRouter = express.Router();
const auth = require("../auth");


//agregar dato de total de caja
/* resumeRouter.post("/create", auth.required, function (req, res, next) {
  const created_at = req.body.created_at;
  const bank_santander = req.body.bank_santander;
  const cash_global = req.body.cash_global;
  const cash_day = req.body.cash_day;
  const cheque_30 = req.body.cheque_30;
  const cheque_60 = req.body.cheque_60;
  const brubank = req.body.brubank;
  if (created_at) {
    resumeController.create(
      created_at,
      bank_santander,
      cash_global,
      cash_day,
      cheque_30,
      cheque_60,
      brubank,
      function (err, result) {
        res.json(result);
      }
    );
  } else {
    res.status(400).json({ response: "Faltan completar datos" });
  }
}) */

resumeRouter.post("/financial", auth.required, function (req, res, next) {
  const start = req.body.start;
  const end = req.body.end;

  resumeController
    .getFinancial(start, end)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res.send(500).json({ response: "Error al obtener los datos" });
    });
});

resumeRouter.post("/financial2", auth.required, function (req, res, next) {
  const start = req.body.start;
  const end = req.body.end;

  resumeController
    .getFinancial2(start, end)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res.send(500).json({ response: 'error al obtener los datos' })
    })
})

resumeRouter.post("/clients", auth.required, function (req, res, next) {
  const start = req.body.start;
  const end = req.body.end;
  resumeController
    .getResumeClients(start, end)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.send(500).json({ response: "Error al obtener los datos" });
    });
});

resumeRouter.post("/investments", auth.required, function (req, res, next) {
  const start = req.body.start;
  const end = req.body.end;
  resumeController
    .getResumeInvestments(start, end)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.send(500).json({ response: "Error al obtener los datos" });
    });
});
module.exports = resumeRouter;
