const userModel = require("../models/userModel");
const jsonwebtoken = require("jsonwebtoken");
const { expressjwt: jwt } = require("express-jwt");

//generar un token de auth
const generateToken = (id, email) => {
  const token = jsonwebtoken.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRE_TIME,
  });
  return token;
};

//autenticacion JWT
const authenticate = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"], //algoritmo para decodificar el token
  requestProperty: "auth",
}).unless({
  path: [
    //no requieren autenticación
    "/user/login",
    "/user/register",
  ],
});

//buscar el usuario en la DB y adjuntarlo a req.user
const setUser = async (req, res, next) => {
  if (req.auth) {
    try {
      const user = await userModel.findById(req.auth.id);
      if (!user) {
        return res.status(404).send({ errMessage: "User not found!" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).send({
        errMessage: "Internal server error occurred!",
        details: error.message,
      });
    }
  } else {
    next();
  }
};

module.exports = {
  generateToken,
  authenticate,
  setUser,
};
