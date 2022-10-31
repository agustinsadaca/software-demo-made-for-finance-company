const express = require("express");
const budgetsController = require("./budgets.controller");
const auth = require("../auth");

const budgetsRouter = express.Router();

budgetsRouter.get("/list", auth.required, function (req, res, next) {
  budgetsController.getList(function (err, result) {
    res.json(result);
  });
});

budgetsRouter.post("/create", auth.required, function (req, res, next) {
  var amount = req.body.amount;
  var imported = req.body.imported;
  var cuotas = req.body.cuotas;
  var total = req.body.total;
  var granTotal = req.body.granTotal;
  var commision = req.body.commision;
  var clientid = req.body.clientid;
  var otorgamiento = req.body.otorgamiento;
  var primera_cuota = req.body.primera_cuota;
  var gastos_otorgamiento = req.body.gastos_otorgamiento;
  var gastos_otorgamiento_value = req.body.gastos_otorgamiento_value;
  if (amount) {
    budgetsController.create(
      amount,
      imported,
      cuotas,
      total,
      granTotal,
      commision,
      clientid,
      otorgamiento,
      primera_cuota,
      gastos_otorgamiento,
      gastos_otorgamiento_value,
      function (err, result) {
        res.json(result);
      }
    );
  } else {
    res.status(400).json({ response: "Faltan completar datos" });
  }
});

budgetsRouter.get("/info/:id", auth.required, function (req, res, next) {
  var taxID = req.params.id;
  budgetsController.getInfo([], taxID, function (err, result) {
    res.json(result);
  });
});

budgetsRouter.get("/client/:clientid", auth.required, function (
  req,
  res,
  next
) {
  var clientid = req.params.clientid;
  budgetsController.getLastClientBudget(clientid, function (err, result) {
    res.json(result);
  });
});

budgetsRouter.post("/update", auth.required, function (req, res, next) {
  const amount = req.body.amount;
  const imported = req.body.imported;
  const cuotas = req.body.cuotas;
  const total = req.body.total;
  const granTotal = req.body.granTotal;
  const commision = req.body.commision;
  const clientid = req.body.clientid;
  const id = req.body.id;
  if (id) {
    const updateValues = {
      name: name,
      percentage: percentage,
      minCommision: mincommision,
      maxCommision: maxcommision,
      useLocation: uselocation,
    };
    budgetsController.updateItem(updateValues, id, function (err, result) {
      res.json(result);
    });
  } else {
    res.status(400).json({ reponse: "Faltan completar datos" });
  }
});

module.exports = budgetsRouter;
