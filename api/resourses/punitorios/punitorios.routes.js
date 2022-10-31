const express = require('express');
const punitoriosController = require('./punitorios.controller');
const punitoriosRouter = express.Router();
const auth = require('../auth');

punitoriosRouter.get("/calculate/:creditid", auth.required, function(req, res) {
  let creditid = req.params.creditid;
  punitoriosController.calculate(creditid).then(data => {
      res.json(data);
    }).catch(error => {
      res.send(500).json({response: "Error al calcular punitorios"});
    });
});

punitoriosRouter.get("/:creditid/:periodo", auth.required, function(req, res, next) {
  let credit_id = req.params.creditid;

  let periodo = req.params.periodo;
  punitoriosController.getByCreditAndPeriod(credit_id, periodo, function(
    err,
    result
  ) {
    res.json(result);
  });
});

punitoriosRouter.put("/:creditid/:periodo", auth.required, function(req, res, next) {
  let credit_id = req.params.creditid;
  let periodo = req.params.periodo;
  var amount = req.body.amount;
  punitoriosController.updateByCreditAndPeriod(credit_id, periodo, amount, function(
    err,
    result
  ) {
    res.json(result);
  });
});
module.exports = punitoriosRouter;
