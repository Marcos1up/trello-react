const userModel = require("../models/userModel");
const { createRandomHexColor } = require("./helperMethods");

const register = async (user, callback) => {
  let newUser = userModel({ ...user, color: createRandomHexColor() }); //asignarle un color random

  await newUser
    .save()
    .then((result) => {
      return callback(false, {
        message: "¡El usuario se ha creado correctamente!",
      });
    })
    .catch((err) => {
      return callback({ errMessage: "¡Tu Email está en uso!", details: err });
    });
};

const login = async (email, callback) => {
  try {
    let user = await userModel.findOne({ email });

    if (!user)
      return callback({ errMessage: "¡Tu correo o contraseña es incorrecto!" });

    return callback(false, { ...user.toJSON() });
  } catch (err) {
    return callback({
      errMessage: "Algo ha salido mal.",
      details: err.message,
    });
  }
};

const getUser = async (id, callback) => {
  try {
    let user = await userModel.findById(id);
    if (!user) return callback({ errMessage: "User not found!" });

    return callback(false, { ...user.toJSON() });
  } catch (err) {
    return callback({
      errMessage: "Something went wrong",
      details: err.message,
    });
  }
};

const getUserWithMail = async (email, callback) => {
  try {
    let user = await userModel.findOne({ email });
    if (!user)
      return callback({
        errMessage: "No hay usuario registrado con este Email.",
      });
    return callback(false, { ...user.toJSON() });
  } catch (error) {
    return callback({
      errMessage: "Algo ha salido mal.",
      details: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getUser,
  getUserWithMail,
};
