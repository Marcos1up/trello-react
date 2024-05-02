const bcrypt = require("bcryptjs");
const userService = require("../services/userService");
const auth = require("../middlewares/auth");

const register = async (req, res) => {
  const { name, surname, email, password } = req.body;

  if (!(name && surname && email && password))
    return res
      .status("400")
      .send({ errMessage: "¡Por favor llene todo los campos!" });

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  req.body.password = hashedPassword;

  await userService.register(req.body, (err, result) => {
    if (err) return res.status(400).send(err);
    return res.status(201).send(result);
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!(email && password))
    return res
      .status(400)
      .send({ errMessage: "¡Por favor llene todo los campos!" });

  await userService.login(email, (err, result) => {
    if (err) return res.status(400).send(err);

    const hashedPassword = result.password;
    if (!bcrypt.compareSync(password, hashedPassword))
      return res
        .status(400)
        .send({ errMessage: "¡Tu correo o contraseña es incorrecto!" });

    result.token = auth.generateToken(result._id.toString(), result.email);
    result.password = undefined;
    result.__v = undefined;

    return res
      .status(200)
      .send({ message: "¡Se ha iniciado sesion correctamente!", user: result });
  });
};

const getUser = async (req, res) => {
  const userId = req.user.id;

  await userService.getUser(userId, (err, result) => {
    if (err) return res.status(404).send(err);

    result.password = undefined;
    result.__v = undefined;

    return res.status(200).send(result);
  });
};

const getUserWithMail = async (req, res) => {
  const { email } = req.body;

  await userService.getUserWithMail(email, (err, result) => {
    if (err) return res.status(400).send({ err });

    const dataTransferObject = {
      name: result.name,
      surname: result.surname,
      color: result.color,
      email: result.email,
    };
    return res.status(200).send(dataTransferObject);
  });
};

module.exports = {
  register,
  login,
  getUser,
  getUserWithMail,
};
