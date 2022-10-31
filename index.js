const express = require("express");
const usersRouter = require("./api/resourses/users/users.routes");
const taxesRouter = require("./api/resourses/taxes/taxes.routes");
const commisionRouter = require("./api/resourses/commisions/commisions.routes");
const budgetsRouter = require("./api/resourses/budgets/budgets.routes");
const creditsRouter = require("./api/resourses/credits/credits.routes");
const mediaRouter = require("./api/resourses/media/media.routes");
const paymentsRouter = require("./api/resourses/payments/payments.routes");
const insurancesRouter = require("./api/resourses/insurances/insurances.routes");
const investmentsRouter = require("./api/resourses/investments/investments.routes");
const punitoriosRouter = require("./api/resourses/punitorios/punitorios.routes");
const resumeRouter = require("./api/resourses/resume/resume.routes");
const cashflowRouter = require("./api/resourses/cash_flow/cashflow.routes");
const notificationsRouter = require("./api/resourses/notifications/notifications.routes");
const logsRouter = require("./api/resourses/logsrecords/logs.routes");
const investmentsController = require("./api/resourses/investments/investments.controller");
const punitoriosController = require("./api/resourses/punitorios/punitorios.controller");
const futurosRouter = require("./api/resourses/futuros/futuros.routes");
const cash_flow_deposit = require('./api/resourses/cash_flow_deposit/cashflowdeposit.routes');
const notasRoutes = require('./api/resourses/notas/notas.routes');
const cajaRoutes = require('./api/resourses/caja/caja.routes');
const cronCheques = require('./api/resourses/caja/caja.controller')
const chequesRoutes = require('./api/resourses/cheques/cheques.routes')

const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = process.env.PORT || 8081;
const bodyParser = require("body-parser");
const mysql = require("mysql");
var multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const AdmZip = require("adm-zip");
const moment = require("moment");
var cors = require("cors");
const cron = require("node-cron");
const mysqli = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});


app.get("/paneladmin", (req, res) => {
  res.send("lola");
});


mysqli.connect((err) => {
  if (err) {
    console.log("Error connecting to Db", err);
    return;
  }
  console.log("Connection established");
});

global.mysqli = mysqli;

app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json());

app.use("/users", usersRouter);
app.use("/taxes", taxesRouter);
app.use("/commisions", commisionRouter);
app.use("/budget", budgetsRouter);
app.use("/credits", creditsRouter);
app.use("/payments", paymentsRouter);
app.use("/investments", investmentsRouter);
app.use("/insurances", insurancesRouter);
app.use("/punitorios", punitoriosRouter);
app.use("/resume", resumeRouter);
app.use("/notifications", notificationsRouter);
app.use("/logs", logsRouter);
app.use("/cash_flow", cashflowRouter);
app.use("/media", mediaRouter);
app.use("/futurosC", futurosRouter);
app.use("/cashflowdeposit", cash_flow_deposit);
app.use("/notas", notasRoutes);
app.use("/cajas", cajaRoutes);
app.use("/cheques", chequesRoutes);

app.use(function (req, res, next) {
  setTimeout(next, 1000);
});
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

class FilesClass {
  constructor(mysqli) {
    this.mysqli = mysqli;
  }

  create(name, path, filename, callback) {
    var mysqli = this.mysqli;
    mysqli.query(
      "INSERT IGNORE INTO files ( name,path,filename) VALUES (?,?,?)",
      [name, path, filename],
      (err, rows) => {
        mysqli.query(
          "SELECT * FROM files ORDER BY id DESC",
          [],
          (err, rows) => {
            if (rows.length > 0) {
              return callback(err, rows[0]);
            } else {
              return callback(err, []);
            }
          }
        );
      }
    );
  }
}

//FILES

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
}).array("file");

app.get("/prueba/:creditId",async function(req,res) {
  const creditId = req.params.creditId;
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  const result = await punitoriosController.calculate(creditId);
  res.send({response:result})
})
app.post("/upload", function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    if (req.files) {
      var zip = new AdmZip();
      var outputFilePath = Date.now() + "output.zip";
      req.files.forEach((file) => {
        console.log(file.path);
        if (file.path) {
          zip.addLocalFile(file.path);
        }
      });
      var willSendthis = zip.toBuffer();
      const fileName = moment() + ".zip";
      const filePath = "files/" + fileName;
      const result = zip.writeZip("files/" + moment() + ".zip");
      var filesClass = new FilesClass(mysqli);
      filesClass.create(
        "Archivos.zip",
        filePath,
        fileName,
        function (err, result) {
          res.send(JSON.stringify(result));
        }
      );
    }
  });
});

app.post("/updateprendadocuments", async function (req, res) {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    const util = require("util");
    const query = util.promisify(mysqli.query).bind(mysqli);
    var creditid;
    if (req.files) {
      if (req.body.creditid) {
        creditid = req.body.creditid;
        console.log("CREDIT_ID", creditid);
        let sql = `SELECT 
        T1.prenda_file, T2.*
    FROM
        cayetano.credits T1
            INNER JOIN
        files T2 ON T1.prenda_file = T2.id
    WHERE
        T1.id = ?
    ORDER BY id DESC
    LIMIT 1;`;
        const creditFile = await query(sql, [creditid]);

        if (creditFile && creditFile != "") {
          //si ya existen archivos existentes
          var zip = new AdmZip(creditFile[0].path);
          var zipEntries = zip.getEntries(); // an array of ZipEntry records
        }
      }

      var zip = new AdmZip();
      var outputFilePath = Date.now() + "output.zip";
      req.files.forEach((file) => {
        console.log(file.path);
        if (file.path) {
          zip.addLocalFile(file.path);
        }
      });

      if (zipEntries && zipEntries.length > 0) {
        zipEntries.forEach(function (zipEntry) {
          zip.addLocalFile("files/" + zipEntry.entryName);
        });
      }

      var willSendthis = zip.toBuffer();
      const fileName = moment() + ".zip";
      const filePath = "files/" + fileName;
      const result = zip.writeZip("files/" + moment() + ".zip");
      var filesClass = new FilesClass(mysqli);
      filesClass.create(
        "Archivos.zip",
        filePath,
        fileName,
        async function (err, result) {
          if (result.id) {
            let sql = `UPDATE credits SET prenda_file = ? WHERE id = ?;`;
            await query(sql, [result.id, creditid]);
          }

          res.send(JSON.stringify(result));
        }
      );
    }
  });
});

app.get("/download/:file", function (req, res) {
  let file = req.params.file;
  const fileDonwload = `${__dirname}/files/${file}`;
  res.download(fileDonwload); // Set disposition and send it.
});

cron.schedule("0 5 * * *", async function () {
  console.log("running a task every day at 5:00");
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);

  await query(`UPDATE crons_executions SET last_execution = ? WHERE id = 1`, [
    new Date(),
  ]);

  //INVERSIONES A 90 DIAS
  const investmentsto90daysQuery = `SELECT 
  CONCAT(T2.lastname," ",T2.name) investor,
  T1.id investmentId,
  DATE(DATE_ADD(T1.ts, INTERVAL T1.period MONTH)) vencimiento
FROM
  investments T1
  LEFT JOIN users T2 ON T1.investorID = T2.id
WHERE
  DATE(DATE_ADD(T1.ts, INTERVAL T1.period - 3 MONTH)) = ?;`;
  const investmentsto90days = await query(investmentsto90daysQuery, [
    new Date(),
  ]);
  if (investmentsto90days.length > 0) {
    investmentsto90days.forEach(async (item) => {
      const content = `La inversion de ${item.investor} vencera en 90 dias, el dia ${item.vencimiento}`;
      const insertNotification = `INSERT INTO notifications (content,notificationDate) VALUES (?,?)`;
      await query(insertNotification, [content, new Date()]);
    });
  }
  //CREDITOS VENCIDOS CON MAS DE 90 DIAS
  const creditos90DaysQuery = `SELECT * FROM
  (SELECT 
      SUM(credits_items.amount + credits_items.safe) totales,
      credits_items.payed,
      credits_items.credit_id,
      credits_items.period,
      SUM(punitorios.amount) punitorios,
      users.name
  FROM
      cayetano.credits_items
      LEFT JOIN punitorios ON credits_items.period = punitorios.period AND credits_items.credit_id = punitorios.credit_id
      LEFT JOIN credits ON credits_items.credit_id = credits.id
      LEFT JOIN users ON users.id = credits.clientID
  WHERE
      DATE(DATE_ADD(credits_items.period, INTERVAL 3 MONTH)) = ?
  GROUP BY credits_items.id) A WHERE (A.totales+A.punitorios) > A.payed GROUP BY credit_id
  ;`;
  const creditos90Days = await query(creditos90DaysQuery, [new Date()]);
  if (creditos90Days.length > 0) {
    creditos90Days.forEach(async (item) => {
      const content = `El credito de ${item.name} #${item.credit_id} tiene deuda de mas de 90 dias`;
      const insertNotification = `INSERT INTO notifications (content,notificationDate) VALUES (?,?)`;
      await query(insertNotification, [content, new Date()]);
    });
  }

  //CREDITOS VENCIDOS CON MAS DE 60 DIAS
  const creditos60DaysQuery = `SELECT * FROM
   (SELECT 
       SUM(credits_items.amount + credits_items.safe) totales,
       credits_items.payed,
       credits_items.credit_id,
       credits_items.period,
       SUM(punitorios.amount) punitorios,
       users.name
   FROM
       cayetano.credits_items
       LEFT JOIN punitorios ON credits_items.period = punitorios.period AND credits_items.credit_id = punitorios.credit_id
       LEFT JOIN credits ON credits_items.credit_id = credits.id
       LEFT JOIN users ON users.id = credits.clientID
   WHERE
       DATE(DATE_ADD(credits_items.period, INTERVAL 2 MONTH)) = ?
   GROUP BY credits_items.id) A WHERE (A.totales+A.punitorios) > A.payed GROUP BY credit_id
   ;`;
  const creditos60Days = await query(creditos60DaysQuery, [new Date()]);
  if (creditos60Days.length > 0) {
    creditos60Days.forEach(async (item) => {
      const content = `El credito de ${item.name} #${item.credit_id} tiene deuda de mas de 60 dias`;
      const insertNotification = `INSERT INTO notifications (content,notificationDate) VALUES (?,?)`;
      await query(insertNotification, [content, new Date()]);
    });
  }

  //Cargar recapitalizaciones automaticas cuando llego el periodo
  const recapitalizacionesQuery = `SELECT * FROM (SELECT 
    T1.*,
      COUNT(T2.id) recapitalizaciones,
      DATE(DATE_ADD(T1.ts, INTERVAL  (COUNT(T2.id) + 1) MONTH)) proxima_recapitalizacion,
      DATE(DATE_ADD(T1.ts, INTERVAL T1.period  MONTH)) vencimiento_final
  FROM
      investments T1
          LEFT JOIN
      recapitalizaciones T2 ON T1.id = T2.investment_id
  WHERE
      T1.recapitalizar = 1
  GROUP BY T1.id   
  ) A
  WHERE A.period > A.recapitalizaciones 
  AND DATE(A.proxima_recapitalizacion) = DATE(NOW())
  `;
  const recapitalizaciones = await query(recapitalizacionesQuery, []);
  if (recapitalizaciones.length > 0) {
    recapitalizaciones.forEach(async (item) => {
      const new_amount = +item.amount * (1 + +item.percentage / 100);
      const recapitalizacion = {
        investmentid: item.id,
        prev_amount: item.amount,
        new_amount: new_amount,
        USER_ID: 1,
      };
      await investmentsController.recapitalizar(recapitalizacion);
    });
  }

  //Cargar punitorios automaticamente
  const punitoriosQuery = `SELECT 
  T1.credit_id
FROM
  cayetano.credits_items T1
  LEFT JOIN cayetano.credits T2 ON T1.credit_id = T2.id
WHERE
  (T1.amount + T1.safe ) > T1.payed
      AND  DATE_ADD(DATE(T1.period),INTERVAL 4 DAY)  < NOW()
      AND T2.status = 1
      GROUP BY T1.credit_id;
      `;
  const punitorios = await query(punitoriosQuery, []);
  if (punitorios.length > 0) {
    await query(
      `UPDATE crons_executions SET last_execution = NOW() WHERE id = 2`,
      []
    );

    punitorios.forEach(async (item) => {
      await punitoriosController.calculate(item.credit_id);
    });
  }
});

cron.schedule("* * * * *", async function () {
  //Ejecutar a cada minuto
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
});
cron.schedule("0 7 * * *", async function () {
  const util = require("util");
  const query = util.promisify(mysqli.query).bind(mysqli);
  cronCheques.cronCheques();
});
