const express = require('express');
const taxesController = require('./taxes.controller');
const auth = require('../auth');
const taxesRouter = express.Router();

taxesRouter.get('/list', auth.required, function(req, res, next) {
    taxesController.getList(function(err, result) {
      res.json(result);
    });
});

taxesRouter.get('/info/:id', auth.required, function(req, res, next) {
    var taxID = req.params.id;
    taxesController.getTax([], taxID, function(err, result) {
      res.json(result);
    });
});

taxesRouter.post('/update', auth.required, function(req, res, next) {
    var name = req.body.name;
    var amount = req.body.amount;
    var percentual = req.body.percentual;
    var quantity = req.body.quantity;
    var imported = req.body.imported;
    var id = req.body.id;
    if (id) {
      var updateValues = {
        name: name,
        amount: amount,
        percentual: percentual,
        quantity: quantity,
        imported: imported
      };
      taxesController.updateTax(updateValues, id, function(err, result) {
        res.json(result);
      });
    } else {
      res.status(400).json({ response: "Faltan completar datos"});
    }
});

taxesRouter.post('/create', auth.required, function(req, res, next) {
    var name = req.body.name;
    var amount = req.body.amount;
    var percentual = req.body.percentual;
    var quantity = req.body.quantity;
    var imported = req.body.imported;
    if (name && amount) {
        taxesController.createTax(name, amount, percentual, quantity, imported, function(
        err,
        result
      ) {
        res.json(result);
      });
    } else {
      res.status(400).json({ response: "Faltan completar datos"});
    }
});

module.exports = taxesRouter;
