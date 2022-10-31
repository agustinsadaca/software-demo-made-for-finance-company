const express = require("express");
const commisionsController = require("./commisions.controller");
const { check, validationResult } = require("express-validator");
const commisionsRouter = express.Router();
const auth = require("../auth");

commisionsRouter.get("/list", auth.required, function (req, res, next) {
  commisionsController.getList(function (err, result) {
    res.json(result);
  });
});

commisionsRouter.post(
  "/create",
  [
    auth.required,
    [
      check("name").exists({ checkNull: true, checkFalsy: true }).isString(),
      /*check("percentage")
        .exists({ checkNull: true, checkFalsy: true })
        .isString(),*/
      check("useLocation")
        .exists({ checkNull: true, checkFalsy: true })
        .isString(),
      check("capitalizationForm").exists({ checkNull: true }).isString(),
      check("minCommision").exists({ checkNull: true }).isString(),
      check("maxCommision").exists({ checkNull: true }).isString(),
    ],
  ],
  function (req, res, next) {
    const name = req.body.name;
    const percentage = req.body.percentage;
    const uselocation = req.body.useLocation;
    const capitalizationForm = req.body.capitalizationForm;
    const minCommision = req.body.minCommision;
    const maxCommision = req.body.maxCommision;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({
        response: "Campos requeridos, debe completar todos los campos",
      });
    }
    commisionsController.create(
      name,
      percentage,
      uselocation,
      capitalizationForm,
      minCommision,
      maxCommision,
      function (err, result) {
        if (err) {
          res.status(500).json({ response: "No se pudo crear la comision" });
        }
        res.json(result);
      }
    );
  }
);

commisionsRouter.get("/info/:id", auth.required, function (req, res, next) {
  var taxID = req.params.id;
  commisionsController.getInfo([], taxID, function (err, result) {
    res.json(result);
  });
});

commisionsRouter.get(
  "/uselocation/:locationId",
  auth.required,
  async (req, res) => {
    let locationID = req.params.locationId;
    const commisions = await commisionsController.getCommisionByUseLocation(
      locationID
    );
    res.json(commisions);
  }
);

commisionsRouter.put(
  "/update",
  [
    auth.required,
    [
      check("name").exists({ checkNull: true, checkFalsy: true }).isString(),
      /*check("percentage")
        .exists({ checkNull: true, checkFalsy: true })
        //.not()
        .isString(),*/
      check("useLocation")
        .exists({ checkNull: true, checkFalsy: true })
        .not()
        .isString(),
      check("id")
        .exists({ checkNull: true, checkFalsy: true })
        .not()
        .isString(),
      check("capitalizationForm").exists({ checkNull: true }).not().isString(),
      check("minCommision").exists({ checkNull: true }),
      check("maxCommision").exists({ checkNull: true }),
    ],
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({
        response:
          "Campos requeridos, debe elegir un monto y una tasa de inversion",
      });
    }
    const id = req.body.id;
    const updateValues = {
      name: req.body.name,
      percentage: req.body.percentage,
      useLocation: req.body.useLocation,
      capitalizationForm: req.body.capitalizationForm,
      minCommision: req.body.minCommision,
      maxCommision: req.body.maxCommision,
    };
    commisionsController.updateItem(updateValues, id, function (err, result) {
      if (err) {
        res.status(500).json({ response: "No se pudo actualizar la comision" });
      }
      res.json(result);
    });
  }
);

module.exports = commisionsRouter;
