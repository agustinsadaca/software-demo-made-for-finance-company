const express = require("express");
const logsController = require("./logs.controller");
const logsRouter = express.Router();
const auth = require("../auth");
const jwt_decode = require("jwt-decode");

logsRouter.get("/list", auth.required, function (req, res, next) {
  logsController
    .list(req.query)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.send(500).json({ response: "Error al obtener registros" });
    });
});

module.exports = logsRouter;
