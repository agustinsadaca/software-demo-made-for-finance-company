const express = require("express");
const creditsController = require("./credits.controller");
const addressController = require("../address/address.controller");
const carsController = require("../cars/cars.controller");
const budgetsController = require("../budgets/budgets.controller");
const auth = require("../auth");
const { add } = require("../cash_flow/cashflow.controller");
const jwt_decode = require("jwt-decode");

const creditsRouter = express.Router();

creditsRouter.get("/list/:clientid", auth.required, function (req, res, next) {
  const clientid = req.params.clientid;
  creditsController.getClientList(clientid, function (err, result) {
    res.json(result);
  });
});

creditsRouter.get("/getcsv", auth.required, function(req,res,next){
  creditsController.getCsv(function(err, result){
    res.json(result)
  });
});

creditsRouter.post("/create_state", auth.required, function (req, res, next) {
  const state = req.body.state;
  creditsController.createState(state, function (err, result) {
    res.json(result);
  });
});

creditsRouter.put("/change_state", auth.required, function (req, res, next) {
  const state = req.body.state;
  const credit_id = req.body.credit_id;
  creditsController.updateState(state, credit_id, function (err, result) {
    res.json(result);
  });
});

creditsRouter.get("/list", auth.required, function (req, res, next) {
  creditsController.getList(function (err, result) {
    res.json(result);
  });
});

creditsRouter.get("/states", auth.required, function (req, res, next) {
  creditsController.getStateList(function (err, result) {
    res.json(result);
  });
});

creditsRouter.delete("/:creditid", auth.required, function (req, res, next) {
  const creditid = req.params.creditid;

  //logueamos quien realizo la accion
  const decoded = jwt_decode(auth.getToken(req));
  const USER_ID = decoded.id;

  creditsController
    .deleteCredit(creditid, USER_ID)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res.send(500).json({ response: "Error al eliminar el credito" });
    });
});

creditsRouter.get("/info/:creditid", auth.required, function (req, res, next) {
  const creditid = req.params.creditid;
  creditsController.getInfo(creditid, function (err, result) {
    res.json(result);
  });
});

creditsRouter.get(
  "/cashflow/:creditid",
  auth.required,
  function (req, res, next) {
    const creditid = req.params.creditid;
    creditsController.getCashFlow(creditid, function (err, result) {
      res.json(result);
    });
  }
);

creditsRouter.get(
  "/cashflow_item/:credititemid",
  auth.required,
  function (req, res, next) {
    const credititemid = req.params.credititemid;
    creditsController.getCashFlowPerCreditItem(
      credititemid,
      function (err, result) {
        res.json(result);
      }
    );
  }
);

creditsRouter.get(
  "/addresses/:creditid",
  auth.required,
  function (req, res, next) {
    const creditid = req.params.creditid;
    creditsController.getCreditAddresses(creditid, function (err, result) {
      res.json(result);
    });
  }
);

creditsRouter.get("/cars/:creditid", auth.required, function (req, res, next) {
  const creditid = req.params.creditid;
  creditsController.getCreditCars(creditid, function (err, result) {
    res.json(result);
  });
});

creditsRouter.get(
  "/prenda/:creditid",
  auth.required,
  function (req, res, next) {
    const creditid = req.params.creditid;
    creditsController.getPrendaInfo(creditid, function (err, result) {
      res.json(result);
    });
  }
);

creditsRouter.get(
  "/finishedlog/:creditid",
  auth.required,
  function (req, res, next) {
    const creditid = req.params.creditid;
    creditsController.getFinishedLog(creditid, function (err, result) {
      res.json(result);
    });
  }
);

creditsRouter.put(
  "/finish/:creditid",
  auth.required,
  function (req, res, next) {
    const creditid = req.params.creditid;
    const userid = req.body.userid;
    const reason = req.body.reason;
    creditsController.setAsFinished(
      creditid,
      userid,
      reason,
      function (err, result) {
        res.json(result);
      }
    );
  }
);

creditsRouter.put(
  "/updatecredit/:creditid",
  auth.required,
  function (req, res, next) {
    const params = req.body.creditDataToUpdate;
    console.log("parametro", params);
    creditsController.updateCredit(params, function (err, result) {
      res.json(result);
    });
  }
);

creditsRouter.post("/prenda/update", auth.required, function (req, res, next) {
  const address = req.body.address;
  const number = req.body.number;
  const department = req.body.department;
  const workaddress = req.body.workaddress;
  const worknumber = req.body.worknumber;
  const workdepartment = req.body.workdepartment;
  const carbrand = req.body.carbrand;
  const carmodel = req.body.carmodel;
  const caryear = req.body.caryear;
  const domain = req.body.domain;
  const details = req.body.details;
  const clientid = req.body.clientid;
  const budget = req.body.budget;
  const creditid = req.body.creditid;
  //logueamos quien realizo la accion
  const decoded = jwt_decode(auth.getToken(req));
  const USER_ID = decoded.id;

  creditsController.updatePrenda(
    address,
    number,
    department,
    workaddress,
    worknumber,
    workdepartment,
    carbrand,
    carmodel,
    caryear,
    domain,
    details,
    clientid,
    budget,
    USER_ID,
    creditid,
    function (err, result) {
      res.json(result);
    }
  );
});

creditsRouter.post("/create", auth.required, async function (req, res, next) {
  //logueamos quien realizo la accion
  const decoded = jwt_decode(auth.getToken(req));
  const USER_ID = decoded.id;

  const address = req.body.address;
  const number = req.body.number;
  const department = req.body.department;
  const workaddress = req.body.workaddress;
  const worknumber = req.body.worknumber;
  const workdepartment = req.body.workdepartment;
  const carbrand = req.body.carbrand;
  const carmodel = req.body.carmodel;
  const caryear = req.body.caryear;
  let domain = req.body.domain;
  domain = domain.replace(/\s+/g, "");
  domain = domain.toUpperCase();
  const details = req.body.details;
  const clientid = req.body.clientid;
  const budget = req.body.budget;
  const cuotas = req.body.cuotas;
  const totalamount = req.body.amount;
  const primera_cuota = req.body.primera_cuota;
  const otorgamiento = req.body.otorgamiento;
  const file_id = req.body.file_id;
  const caja_id = req.body.caja_id;
  const account_id = req.body.account_id;

  if (domain) {
    let carID = 0;

    budgetsController.getInfo([], budget, function (err, result) {
      const budgetInfo = {
        budgetAmount: result.amount,
        budgetGastosOtorgamientoValue: result.gastos_otorgamiento_value,
        commision: result.commision,
        gastos_otorgamiento: result.gastos_otorgamiento,
        total: result.total,
      };
      let type = 1;
      addressController.create(
        address,
        number,
        department,
        type,
        clientid,
        budget,
        function (err, result) {
          let type = 2;
          addressController.create(
            workaddress,
            worknumber,
            workdepartment,
            type,
            clientid,
            budget,
            function (err, result) {
              carsController.create(
                carbrand,
                carmodel,
                caryear,
                domain,
                details,
                clientid,
                function (err, result) {
                  if (result) {
                    carID = result.id;
                    console.log("CARID", result);
                    if (carID) {
                      creditsController.create(
                        clientid,
                        carID,
                        budget,
                        primera_cuota,
                        otorgamiento,
                        file_id,
                        USER_ID,
                        account_id,
                        caja_id,
                        function (err, result) {
                          let creditID = result.id;
                          creditsController.createItems(
                            totalamount,
                            cuotas,
                            creditID,
                            primera_cuota,
                            budgetInfo,
                            function (err, result) {
                              if (result) {
                                res.send(JSON.stringify(result));
                              }
                            }
                          );
                        }
                      );
                    } else {
                      res
                        .status(400)
                        .json({ response: "No se pudo cargar la prenda" });
                    }
                  }
                }
              );
            }
          );
        }
      );
    });
  } else {
    res.status(400).json({ response: "Faltan completar datos" });
  }
});

creditsRouter.post("/import", auth.required, function (req, res, next) {
  const multer = require("multer");
  const fs = require("fs");
  const csv = require("csv-parser");

  var dir = "./files";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "files");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
  const upload = multer({
    storage: storage,
  }).single("file");
  // upload file
  upload(req, res, function (err) {
    const promises = [];
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    if (req.file.path) {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
          //console.log("row", row);
          if (
            // row.hasOwnProperty("pepe") &&
            row.hasOwnProperty("monto_sin_impuestos") &&
            row.hasOwnProperty("monto_final") &&
            row.hasOwnProperty("tasa") &&
            row.hasOwnProperty("fecha_otorgamiento") &&
            row.hasOwnProperty("fecha_primera_cuota") &&
            row.hasOwnProperty("cuotas") &&
            row.hasOwnProperty("pagado") &&
            row.hasOwnProperty("vehiculo_patente") &&
            row.hasOwnProperty("cliente_dni") &&
            row.hasOwnProperty("seguro")
          ) {
            promises.push(creditsController.importCredit(row));
          }
        })
        .on("end", () => {
          console.log("archivo completamente importado");

          if (promises.length == 0) {
            return res.status(400).json({
              error:
                "El archivo tiene un mal formato, no se encontraron ninguna de las columnas necesarias o no se ha importado ningun credito",
            });
          } else {
            executeAllPromises(promises).then(function (items) {
              // Result
              let statusCode = 200;
              let responseMessage = `${items.results.length} Créditos importados satisfactoriamente`;
              const errors = items.errors.map(function (error) {
                return error.message;
              });
              if (items.results.length == 0) {
                responseMessage = "No se ha podido insertar ningun credito.";
              }
              if (items.errors.length > 0) {
                statusCode = 500;
                responseMessage += `${items.errors[0]}`;
              }
              res.status(statusCode).json({
                response: responseMessage,
                errors: { length: items.errors.length, errors: errors },
              });
              console.log(`Executed all ${promises.length} Promises:`);
              console.log(`— ${items.results.length} Promises were successful`);
              console.log(
                `— ${items.errors.length} Promises failed: ${errors}`
              );
            });
          }
        });
    } else {
      return res.status(500).json("No se pudo leer el archivo");
    }
  });
});

creditsRouter.get(
  "/download/coupons/:creditid",
  auth.required,
  async function (req, res, next) {
    const fs = require("fs");
    const creditid = req.params.creditid;
    let couponsTpl = fs.readFileSync("./templates/coupons.html", "utf8");
    let couponTpl = fs.readFileSync("./templates/coupon.html", "utf8");
    const moment = require("moment");
    const coupons = await creditsController.getPaymentCoupons(creditid);
    let cupon_block = "";
    coupons.forEach((cupon, i) => {
      let thisCupon = couponTpl.replace(
        "{{logo}}",
        `https://emprendo-public-assets.s3.us-east-2.amazonaws.com/logo.png`
      );
      thisCupon = thisCupon.replace("{{cuota}}", i + 1 + "/" + cupon.cuotas);
      thisCupon = thisCupon.replace(
        "{{fecha}}",
        moment(cupon.period).format("DD/MM/YYYY")
      );
      thisCupon = thisCupon.replace(
        "{{monto}}",
        cupon.cuota.toString().replace(/\./g, ",")
      );
      cupon_block += thisCupon;
      if ((i + 1) % 3 === 0) {
        cupon_block += '<div style="page-break-before: always;"> </div>';
      }
    });
    let html = couponsTpl.replace("{{cupon_block}}", cupon_block);
    res.json({ html: html });
  }
);

creditsRouter.get(
  "/download/:creditid",
  auth.required,
  async function (req, res, next) {
    const fs = require("fs");
    const creditid = req.params.creditid;
    let tmpl = fs.readFileSync("./templates/credit.html", "utf8");
    let options = {
      format: "A4",
      phantomPath: "./node_modules/phantomjs-prebuilt/bin/phantomjs",
    };
    const moment = require("moment");
    const creditInfo = await creditsController.getPrintInfo(creditid);
    let html = tmpl.replace(
      "{{logo}}",
      `https://emprendo-public-assets.s3.us-east-2.amazonaws.com/logo.png`
    );
    html = html.replace("{{fecha}}", moment().format("DD/MM/YYYY"));
    html = html.replace("{{idCredito}}", creditid);
    html = html.replace(
      "{{apellido_nombre}}",
      creditInfo.client.apellido_nombre
    );
    html = html.replace("{{dni}}", creditInfo.client.dni);
    html = html.replace("{{telefono}}", creditInfo.client.telefono);
    html = html.replace("{{email}}", creditInfo.client.email);
    html = html.replace(
      "{{additionaldata}}",
      creditInfo.status[0].additionaldata
    );
    html = html.replace("{{car_brand}}", creditInfo.car.car_brand);
    html = html.replace("{{car_model}}", creditInfo.car.car_model);
    html = html.replace("{{car_year}}", creditInfo.car.car_year);
    html = html.replace("{{car_domain}}", creditInfo.car.car_domain);
    html = html.replace("{{car_details}}", creditInfo.car.car_details);
    html = html.replace("{{budget_amount}}", creditInfo.budget.budget_amount);
    html = html.replace("{{budget_cuotas}}", creditInfo.budget.budget_cuotas);
    html = html.replace(
      "{{budget_commision}}",
      creditInfo.budget.budget_commision
    );
    html = html.replace(
      "{{budget_otorgamiento}}",
      moment(creditInfo.budget.budget_otorgamiento).format("DD/MM/YYYY")
    );
    html = html.replace(
      "{{budget_primera_cuota}}",
      moment(creditInfo.budget.budget_primera_cuota).format("DD/MM/YYYY")
    );
    console.log(creditInfo.status);
    let block_credit_status = "";
    let block_deuda = 0;

    let blockaddressblock = "";
    creditInfo.addresses.forEach((address) => {
      blockaddressblock += "<tr>";
      blockaddressblock +=
        "<td>" +
        "Domicilio " +
        (address.type == 1 ? "Real" : "Laboral") +
        "</td>";
      blockaddressblock +=
        "<td>" +
        address.address +
        " " +
        address.number +
        " " +
        address.department +
        "</td>";
      blockaddressblock += "</tr>";
    });

    creditInfo.status.forEach(function (item) {
      block_deuda += Number(item.deuda);
      // console.log(item);
      block_credit_status += "<tr>";
      block_credit_status +=
        "<td>" + moment(item.period).format("DD/MM/YYYY") + "</td>";
      block_credit_status += "<td>$" + item.cuota + "</td>";
      block_credit_status += "<td>$" + item.seguro + "</td>";
      block_credit_status +=
        "<td>$" + (item.punitorios ? item.punitorios : 0) + "</td>";
      block_credit_status +=
        "<td>$" +
        (
          item.cuota +
          item.seguro +
          (item.punitorios ? item.punitorios : 0)
        ).toFixed(2) +
        "</td>";
      block_credit_status +=
        "<td>" +
        (item.pagado == "" || item.pagado == null
          ? "Impago"
          : "Pagado $" + item.pagado) +
        "</td>";
      block_credit_status +=
        "<td>$" +
        (
          item.cuota +
          item.seguro +
          (item.punitorios ? item.punitorios : 0) -
          item.pagado
        ).toFixed(2) +
        "</td>";
      block_credit_status += "<td>$" + Number(item.deuda).toFixed(2) + "</td>";
      block_credit_status += "</tr>";
    });

    html = html.replace("{{block_credit_status}}", block_credit_status);
    html = html.replace("{{block_deuda}}", block_deuda);

    html = html.replace("{{blockaddressblock}}", blockaddressblock);

    res.json({ html: html });
  }
);
function executeAllPromises(promises) {
  // Wrap all Promises in a Promise that will always "resolve"
  const resolvingPromises = promises.map(function (promise) {
    return new Promise(function (resolve) {
      const payload = new Array(2);
      promise
        .then(function (result) {
          payload[0] = result;
        })
        .catch(function (error) {
          payload[1] = error;
        })
        .then(function () {
          resolve(payload);
        });
    });
  });

  const errors = [];
  const results = [];

  // Execute all wrapped Promises
  return Promise.all(resolvingPromises).then(function (items) {
    items.forEach(function (payload) {
      if (payload[1]) {
        errors.push(payload[1]);
      } else {
        results.push(payload[0]);
      }
    });

    return {
      errors: errors,
      results: results,
    };
  });
}
module.exports = creditsRouter;
