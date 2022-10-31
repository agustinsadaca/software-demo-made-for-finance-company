const express = require("express");
const usersController = require("./users.controller");
const auth = require("../auth");

const usersRouter = express.Router();

usersRouter.post("/login", function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  if (email || password) {
    usersController.login(email, password, function (err, result) {
      console.log(err);
      console.log(result);
      res.json(result);
    });
  } else {
    res.status(400).json({ response: "Debe enviarse email y contraseña" });
  }
});

usersRouter.get("/list", function (req, res, next) {
  let type = "";
  if (req.query.type) {
    type = req.query.type;
  }
  console.log(type);
  usersController.getUsers(type, function (err, result) {
    res.json(result);
  });
});

usersRouter.get("/types", auth.required, function (req, res, next) {
  usersController.getUserTypes(function (err, result) {
    res.json(result);
  });
});

usersRouter.get("/privileges", auth.required, function (req, res, next) {
  usersController.getUserPrivileges(function (err, result) {
    res.json(result);
  });
});

usersRouter.get("/info/:userID", auth.required, async (req, res) => {
  var userID = req.params.userID;
  const user = await usersController.getUser(userID);
  res.json({
    user: user,
  });
});

usersRouter.post("/pause", auth.required, function (req, res, next) {
  var id = req.body.id;
  var status = req.body.status;
  if (id && status) {
    usersController.pauseUser(id, status, function (err, result) {
      res.json(result);
    });
  } else {
    res.status(400).json({ response: "Debe enviarse id y estado" });
  }
});

usersRouter.delete("/delete/:id", auth.required, function (req, res, next) {
  var userID = req.params.id;
  usersController.deleteUser(userID, function (err, result) {
    res.json(result);
  });
});

usersRouter.post("/recoverpassword", function (req, res, next) {
  var email = req.body.email;
  if (email) {
    usersController.recoverPassword(email, function (err, result) {
      res.json(result);
    });
  } else {
    res.status(400).json({ response: "Debe enviarse email" });
  }
});

usersRouter.post("/update", auth.required, function (req, res, next) {
  const name = req.body.name;
  const lastname = req.body.lastname;
  const type = req.body.type;
  const email = req.body.email;
  const password = req.body.password;
  const dni = req.body.dni;
  const phone = req.body.phone;
  const privileges = JSON.stringify(req.body.privileges);
  const probability = req.body.probability;
  const additionalInfo = req.body.additionalInfo;
  const id = req.body.id;
  if ((email && password) || type == 4) {
    var updateValues = {
      name: name,
      lastname: lastname,
      type: type,
      email: email,
      password: password,
      dni: dni,
      phone: phone,
      privileges: privileges,
      probability: probability,
      additionalInfo: additionalInfo,
    };
    usersController.updateUser(updateValues, id, function (err, result) {
      res.json(result);
    });
  } else {
    res.status(400).json({ response: "Faltan completar datos" });
  }
});

usersRouter.post("/create", function (req, res, next) {
  const name = req.body.name;
  const lastname = req.body.lastname;
  const type = req.body.type;
  const email = req.body.email;
  const password = req.body.password;
  const dni = req.body.dni;
  const privileges = req.body.privileges;
  const phone = req.body.phone;
  const probability = req.body.probability;
  usersController.createUser(
    name,
    lastname,
    type,
    email,
    password,
    dni,
    privileges,
    phone,
    probability,
    function (err, result) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json(result);
      }
    }
  );
});

module.exports = usersRouter;
