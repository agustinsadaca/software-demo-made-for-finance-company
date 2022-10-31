var jwt = require("express-jwt");
var secret = require("../../config").secret;

function getTokenFromHeader(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  if (req.query.token) {
    return req.query.token;
  }

  return null;
}

var auth = {
  getToken: getTokenFromHeader,
  required: jwt({
    secret: secret,
    userProperty: "payload",
    getToken: getTokenFromHeader,
  }),
  optional: jwt({
    secret: secret,
    userProperty: "payload",
    credentialsRequired: false,
    getToken: getTokenFromHeader,
  }),
};

module.exports = auth;
