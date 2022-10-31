const express = require('express');
const cashflowdepositcontroller = require('./cashflowdeposit.controller');
const auth  = require('../auth');
const cashflowdepositrouter = express.Router();

cashflowdepositrouter.get('/list', auth.required, function(req, res) {
    const start = req.query.start;
    const end = req.query.end;
    cashflowdepositcontroller
    .getMovements(start,end)
    .then((data) => {
        res.json(data);
    })
    .catch((err) => {
        console.log(err)
        res.send(500).json({response: "Error al obtener datos"})  
    });
});

module.exports = cashflowdepositrouter;