const express = require("express");
const insurancesController = require("./insurances.controller");
const creditsController = require("../credits/credits.controller");
var multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const auth = require("../auth");
const insurancesRouter = express.Router();

insurancesRouter.post("/add", auth.required, function (req, res, next) {
  const amount = req.body.amount;
  const imputation_date = req.body.imputation_date;
  const car_id = req.body.car_id;
  const credit_id = req.body.creditId;

  insurancesController.insertNew(
    amount,
    imputation_date,
    car_id,
    credit_id,
    function (err, result) {
      res.json(result);
    }
  );
});

insurancesRouter.get("/list", auth.required, function (req, res, next) {
  insurancesController.getAll(function (err, result) {
    res.json(result);
  });
});

insurancesRouter.delete("/:id", auth.required, function (req, res, next) {
  let id = req.params.id;
  insurancesController.deleteInsurance(id, function (err, result) {
    res.json(result);
  });
});

insurancesRouter.get("/list/:carid", auth.required, function (req, res, next) {
  let carid = req.params.carid;

  insurancesController.getList(carid, function (err, result) {
    res.json(result);
  });
});

insurancesRouter.get(
  "/info/:insuranceid",
  auth.required,
  function (req, res, next) {
    let insuranceid = req.params.insuranceid;

    insurancesController.getInfo(insuranceid, function (err, result) {
      res.json(result);
    });
  }
);

insurancesRouter.put(
  "/update/:insuranceid",
  auth.required,
  function (req, res, next) {
    let insuranceid = req.params.insuranceid;
    let amount = req.body.amount;

    insurancesController.updateInsurance(
      amount,
      insuranceid,
      function (err, result) {
        res.json(result);
      }
    );
  }
);

var dir = "./files";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("file");

insurancesRouter.post("/import", auth.required, function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    if (req.file.path) {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
          if (row.hasOwnProperty("dominio") && row.hasOwnProperty("monto")) {
            let domain = row.dominio;
            let amount = row.monto;
            creditsController.updateInsurance(
              domain,
              amount,
              function (err, result) {}
            );
          } else {
            return res.status(500).json("El archivo tiene un formato invalido");
          }
        })
        .on("end", () => {
          let response = {
            response: 1,
            message: "Importado con exito",
          };
          return res.status(200).json(response);
        });
    } else {
      return res.status(500).json("No se pudo leer el archivo");
    }
  });
});

module.exports = insurancesRouter;
