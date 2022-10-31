const express = require("express");
const paymentsController = require("./payments.controller");
const { check, validationResult } = require("express-validator");
const paymentsRouter = express.Router();
const auth = require("../auth");
const jwt_decode = require("jwt-decode");
const puppeteer = require("puppeteer");
const fs = require("fs");

paymentsRouter.post(
  "/add",
  [
    auth.required,
    [
      check("formData.payment_amount").exists({
        checkNull: true,
        checkFalsy: true,
      }),
      check("formData.payment_date").exists({
        checkNull: true,
        checkFalsy: true,
      }),
      check("formData.credit_id").exists({ checkNull: true, checkFalsy: true }),
      check("formData.client_id").exists({ checkNull: true, checkFalsy: true }),
    ],
  ],
  function (req, res, next) {
    const cash_flow_list = req.body.cash_flow_list;
    const gran_total = req.body.gran_total;
    const payment_amount = req.body.formData.payment_amount;
    const payment_date = req.body.formData.payment_date;
    const credit_id = req.body.formData.credit_id;
    const client_id = req.body.formData.client_id;
    const account_id = req.body.formData.account_id;
    const caja_id = req.body.formData.caja_id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ response: "Campos requeridos, debe elegir un monto y fecha" });
    }
    
    const decoded = jwt_decode(auth.getToken(req));
    const USER_ID = decoded.id;
    console.log(USER_ID)

    paymentsController
      .insertPayment(
        payment_amount,
        payment_date,
        credit_id,
        client_id,
        cash_flow_list,
        gran_total,
        USER_ID,
        account_id,
        caja_id
      )

      .then((data) => {
        console.log(data, "Data");
        res.json(data);
      })
      .catch((error) => {
        res.sendStatus(500).json({ response: "Error al calcular punitorios" });
      });
  }
);

paymentsRouter.get("/list/:creditid", auth.required, function (req, res, next) {
  let credit_id = req.params.creditid;

  paymentsController.getList(credit_id, function (err, result) {
    res.json(result);
  });
});

paymentsRouter.get(
  "/listdeleted/:creditid",
  auth.required,
  function (req, res, next) {
    let credit_id = req.params.creditid;

    paymentsController.getListDeleted(credit_id, function (err, result) {
      res.json(result);
    });
  }
);

paymentsRouter.put(
  "/update/:paymentid",
  auth.required,
  function (req, res, next) {
    let paymentid = req.params.paymentid;
    let amount = req.body.amount;
    let paymentDate = req.body.paymentDate;

    paymentsController.updatePayment(
      amount,
      paymentDate,
      paymentid,
      function (err, result) {
        res.json(result);
      }
    );
  }
);

paymentsRouter.get(
  "/info/:paymentid",
  auth.required,
  function (req, res, next) {
    let paymentid = req.params.paymentid;
    paymentsController.getInfo(paymentid, function (err, result) {
      res.json(result);
    });
  }
);

paymentsRouter.post(
  "/delete/:paymentid",
  auth.required,
  function (req, res, next) {
    let paymentid = req.params.paymentid;
    let reason = req.body.deletionReason;
    let user_id = req.body.userID;

    paymentsController.deletePayment(
      paymentid,
      reason,
      user_id,
      function (err, result) {
        res.json(result);
      }
    );
  }
);

paymentsRouter.get(
  "/download/:paymentid",
  auth.required,
  async function (req, res, next) {
    const paymentid = req.params.paymentid;
    let paymentsTpl = fs.readFileSync("./templates/payments.html", "utf8");
    let paymentTpl = fs.readFileSync("./templates/payment.html", "utf8");
    let options = { format: "A4" };
    const moment = require("moment");
    const payment = await paymentsController.get(paymentid); // uno solo
    const quotes = await paymentsController.getPayed(payment.payed_ci); // varios cuotas posible
    let payment_block = "";
    let html = paymentsTpl.replace(
      "{{logo}}",
      `https://emprendo-public-assets.s3.us-east-2.amazonaws.com/logo.png`
    );
    html = html.replace(
      "{{fecha}}",
      moment(payment.paymentDate).format("DD/MM/YYYY")
    );
    html = html.replace("{{nombre}}", payment.name);
    html = html.replace("{{pago}}", payment.amount);
    quotes.forEach((quote, i) => {
      let thisQuote = paymentTpl.replace(
        "{{cuota}}",
        moment(quote.period).format("DD/MM/YYYY")
      );
      thisQuote = thisQuote.replace(
        "{{numerocuota}}",
        quote.cuota.toString().replace(/\./g, ",")
      );
      const saldo = Number(quote.payed) - Number(quote.amount);
      thisQuote = thisQuote.replace(
        "{{importe}}",
        quote.payed.toString().replace(/\./g, ",")
      );
      thisQuote = thisQuote.replace(
        "{{seguro}}",
        quote.safe.toString().replace(/\./g, ",")
      );
      thisQuote = thisQuote.replace(
        "{{punitorios}}",
        quote.punitorios.toString().replace(/\./g, ",")
      );
      thisQuote = thisQuote.replace(
        "{{action}}",
        quote.accion.toString().replace(/\./g, ",")
      );
      payment_block += thisQuote;
    });
    html = html.replace("{{payment_block}}", payment_block);
    html = html.replace("{{grantotal}}", payment.amount);
    html =
      '<div style="padding: 5mm; text-align: justify; font-size: 10px;text-align:center;border-top: 2px dashed black;">CUPON PARA EL CLIENTE</div>' +
      html +
      '<div style="padding: 5mm; text-align: justify; font-size: 10px;text-align:center;border-top: 2px dashed black;">CUPON PARA LA FINANCIERA</div>' +
      html;
    res.json({ html: html });
  }
);

module.exports = paymentsRouter;
