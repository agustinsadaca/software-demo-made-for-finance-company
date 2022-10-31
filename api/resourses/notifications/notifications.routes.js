const express = require('express');
const notificationsController = require('./notifications.controller');
const { check, validationResult } = require('express-validator');
const notificationsRouter = express.Router();
const auth = require('../auth');

notificationsRouter.post('/add', auth.required, function (req, res, next) {
  const content = req.body.content;
  //console.log(req.payload);
  notificationsController.insert(content).then( data => {
    res.json(data);
  }).catch(error => {
    res.send(500).json({response: "Error al insertar notificación"});
  });
});

notificationsRouter.get('/list', auth.required, function (req, res, next) {
  const currentUser = req.payload; // usuario logueado
  notificationsController.list(currentUser.id).then( data => {
    res.json(data);
  }).catch(error => {
    res.send(500).json({response: "Error al obtener notificaciones"});
  });
});

notificationsRouter.put('/read', auth.required, function (req, res, next) {
  const currentUser = req.payload; // usuario logueado
  const notificationId = req.body.id;
  //console.log(currentUser);
  notificationsController.read(notificationId, currentUser.id).then( data => {
    res.json(data);
  }).catch(error => {
    res.send(500).json({response: "Error al actualizar notificacion"});
  });
});

notificationsRouter.get('/gen', function (req, res, next) {
  notificationsController.gen().then( data => {
    res.json({status: "ok"});
  }).catch(error => {
    res.send(500).json({response: "Error al generar notificaciones"});
  });
});

module.exports = notificationsRouter;
