const express = require("express");
const investmentsController = require("./investments.controller");
const { check, validationResult } = require("express-validator");
const auth = require("../auth");
const jwt_decode = require("jwt-decode");

const investmentsRouter = express.Router();

investmentsRouter.get("/all", auth.required, async (req, res) => {
  const investments = await investmentsController.getAllInvestements();
  res.json(investments);
});

investmentsRouter.get(
  "/investment/:investmentId",
  auth.required,
  async (req, res) => {
    const investmentId = req.params.investmentId;
    const investments = await investmentsController.getInvestementInfo(
      investmentId
    );
    res.json(investments);
  }
);

investmentsRouter.get(
  "/retiros/:investmend_id",
  auth.required,
  async (req, res) => {
    const investmend_id = req.params.investmend_id;
    const investments = await investmentsController.getRetiros(investmend_id);
    res.json(investments);
  }
);

investmentsRouter.get(
  "/investor/:investorID",
  auth.required,
  async (req, res) => {
    const investorID = req.params.investorID;
    const investments = await investmentsController.getInvestmentsByInvestor(
      investorID
    );
    res.json(investments);
  }
);

investmentsRouter.get(
  "/payments/:investmentid",
  auth.required,
  async (req, res) => {
    const investmentid = req.params.investmentid;
    const investments = await investmentsController.getPaymentsByInvestment(
      investmentid
    );
    res.json(investments);
  }
);

investmentsRouter.get(
  "/recapitalizaciones/:investmentid",
  auth.required,
  async (req, res) => {
    const investmentid = req.params.investmentid;
    const investments = await investmentsController.getRecapitalizaciones(
      investmentid
    );
    res.json(investments);
  }
);

investmentsRouter.post("/recapitalizar", auth.required, async (req, res) => {
  const decoded = jwt_decode(auth.getToken(req));
  const USER_ID = decoded.id;

  const recapitalizacion = {
    investmentid: req.body.investmentId,
    prev_amount: req.body.prev_amount,
    new_amount: req.body.new_amount,
    USER_ID,
  };
  investments = await investmentsController.recapitalizar(recapitalizacion);
  res.json(investments);
});

investmentsRouter.post(
  "/recapitalizar_auto",
  auth.required,
  async (req, res) => {
    const decoded = jwt_decode(auth.getToken(req));
    const USER_ID = decoded.id;

    const recapitalizacion = {
      investmentId: req.body.investmentId,
      status: req.body.status,
      USER_ID,
    };
    investments = await investmentsController.recapitalizar_auto(
      recapitalizacion
    );
    res.json(investments);
  }
);

investmentsRouter.post(
  "/recapitalizar_status",
  auth.required,
  async (req, res) => {
    const decoded = jwt_decode(auth.getToken(req));
    const USER_ID = decoded.id;

    const recapitalizacion = {
      investmentId: req.body.investmentId,
      status: req.body.status,
      USER_ID,
    };
    investments = await investmentsController.recapitalizar_status(
      recapitalizacion
    );
    res.json(investments);
  }
);

investmentsRouter.post(
  "/",
  [
    auth.required,
    [
      check("investorID").exists({ checkNull: true, checkFalsy: true }),
      check("amount").exists({ checkNull: true, checkFalsy: true }),
      check("percentage").exists({ checkNull: true, checkFalsy: true }),
      check("termID").exists({ checkNull: true, checkFalsy: true }),
      check("period").exists({ checkNull: true, checkFalsy: true }),
      check("ts").exists({ checkNull: true, checkFalsy: true }),
      check("account_id").exists({ checkNull: true, checkFalsy: true }),
    ],
  ],
  async (req, res) => {
    //logueamos quien realizo la accion
    const decoded = jwt_decode(auth.getToken(req));
    const USER_ID = decoded.id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        response:
          "Campos requeridos, debe elegir un monto y una tasa de inversion",
      });
    }
    let investment = req.body;
    let account_id = req.body.account_id;
    let caja_id = req.body.caja_id;
    try {
      const newInvestment = await investmentsController.createInvestment(
        investment,
        USER_ID,
        account_id,
        caja_id
      );
      res.json(newInvestment);
    } catch (e) {
      res.status(500).send(e);
    }
  }
);

investmentsRouter.post(
  "/pay",
  [
    auth.required,
    [
      check("investmentID").exists({ checkNull: true, checkFalsy: true }),
      check("amount").exists({ checkNull: true, checkFalsy: true }),
      // check("period").exists({ checkNull: true, checkFalsy: true }),
    ],
  ],
  async (req, res) => {
    const decoded = jwt_decode(auth.getToken(req));
    const USER_ID = decoded.id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        response: "Campos requeridos, debe elegir inversión y monto",
      });
    }
    let investment = req.body;
    let account_id = req.body.account_id;
    let caja_id = req.body.caja_id;
    try {
      const newInvestment = await investmentsController.payInvestment(
        investment,
        USER_ID,
        account_id,
        caja_id
      );
      res.json(newInvestment);
    } catch (e) {
      console.error(e);
      res.status(500).send(e);
    }
  }
);

module.exports = investmentsRouter;
