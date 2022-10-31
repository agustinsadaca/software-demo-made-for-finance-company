const express = require("express");
const cashFlowController = require("./cashflow.controller");
const cashFlowRouter = express.Router();
const auth = require("../auth");

// cash flow accounts
cashFlowRouter.get("/accounts", auth.required, function (req, res, next) {
  cashFlowController
    .getAccounts()
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res.send(500).json({ response: "Error al obtener los datos" });
    });
});

cashFlowRouter.post("/accounts", auth.required, function (req, res, next) {
  const name = req.body.name;
  cashFlowController
    .addAccount(name)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res.send(500).json({ response: "Error al obtener los datos" });
    });
});

cashFlowRouter.delete(
  "/accounts/:id",
  auth.required,
  function (req, res, next) {
    const id = req.params.id;
    cashFlowController
      .deleteAccount(id)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        console.log(error);
        res.send(500).json({ response: "Error al obtener los datos" });
      });
  }
);

// cash flow

cashFlowRouter.delete("/:id", auth.required, function (req, res, next) {
  const id = req.params.id;
  cashFlowController
    .deleteCashFlow(id)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res.send(500).json({ response: "Error al borrar el movimiento" });
    });
});

cashFlowRouter.get("/list", auth.required, function (req, res, next) {
  const start = req.query.start;
  const end = req.query.end;
  cashFlowController
    .getMovements(start, end)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res.send(500).json({ response: "Error al obtener los datos" });
    });
});

cashFlowRouter.get(
  "/credit_list/:creditid",
  auth.required,
  function (req, res, next) {
    const credit_id = req.params.creditid;
    cashFlowController
      .getCreditListMovements(credit_id)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        console.log(error);
        res.send(500).json({ response: "Error al obtener los datos" });
      });
  }
);

cashFlowRouter.get("/total", auth.required, function (req, res, next) {
  const start = req.query.start;
  const end = req.query.end;
  cashFlowController
    .getTotal(start, end)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res.send(500).json({ response: "Error al obtener los datos" });
    });
});

cashFlowRouter.post("/add", auth.required, function (req, res, next) {

  const type = req.body.type;
  const amount = req.body.payment_amount;
  const created_at = req.body.payment_date;
  const description = req.body.description;
  const user = req.body.user;
  const credit_id = req.body.credit_id ?? null;
  const operation_type = req.body.operation_type;
  const investment_id = req.body.investment_id ?? null;
  const account_id = req.body.account_id;
  const responsable_id = req.body.responsable_id;
  const caja_id = req.body.caja_id;
  /* const cash_flow_account_id = req.body.cash_flow_account_id; */
  cashFlowController
    .add(
      type,
      amount,
      created_at,
      description,
      user,
      credit_id,
      operation_type,
      investment_id,
      account_id,
      responsable_id,
      caja_id
      /* cash_flow_account_id */
    )
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res.send(500).json({ response: "Error al obtener los datos" });
    });
});

module.exports = cashFlowRouter;
