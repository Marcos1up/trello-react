const boardService = require("../services/boardService");

const create = async (req, res) => {
  const { title, backgroundImageLink } = req.body;
  if (!(title && backgroundImageLink))
    return res
      .status(400)
      .send({ errMessage: "El título y/o la imagen no pueden ser nulos." });

  await boardService.create(req, (err, result) => {
    if (err) return res.status(500).send(err);

    result.__v = undefined;
    return res.status(201).send(result);
  });
};

const getAll = async (req, res) => {
  //Validar si params.id está en los tableros del usuario
  const userId = req.user.id;
  await boardService.getAll(userId, (err, result) => {
    if (err) return res.status(400).send(err);

    return res.status(200).send(result);
  });
};

const getById = async (req, res) => {
  const validate = req.user.boards.filter((board) => board === req.params.id);
  if (!validate)
    return res.status(400).send({
      errMessage:
        "¡No puedes mostrar este tablero, no eres miembro ni propietario!",
    });

  await boardService.getById(req.params.id, (err, result) => {
    if (err) return res.status(400).send(err);

    return res.status(200).send(result);
  });
};

const getActivityById = async (req, res) => {
  const validate = req.user.boards.filter((board) => board === req.params.id);
  if (!validate)
    return res.status(400).send({
      errMessage:
        "¡No puedes mostrar este tablero, no eres miembro ni propietario!",
    });

  await boardService.getActivityById(req.params.id, (err, result) => {
    if (err) return res.status(400).send(err);

    return res.status(200).send(result);
  });
};

const updateBoardTitle = async (req, res) => {
  const validate = req.user.boards.filter((board) => board === req.params.id);
  if (!validate)
    return res.status(400).send({
      errMessage:
        "¡No puedes mostrar este tablero, no eres miembro ni propietario!",
    });

  const { boardId } = req.params;
  const { title } = req.body;

  await boardService.updateBoardTitle(
    boardId,
    title,
    req.user,
    (err, result) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send(result);
    }
  );
};

const updateBoardDescription = async (req, res) => {
  const validate = req.user.boards.filter((board) => board === req.params.id);
  if (!validate)
    return res.status(400).send({
      errMessage:
        "¡No puedes mostrar este tablero, no eres miembro ni propietario!",
    });

  const { boardId } = req.params;
  const { description } = req.body;

  await boardService.updateBoardTitle(
    boardId,
    description,
    req.user,
    (err, result) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send(result);
    }
  );
};

const updateBackground = async (req, res) => {
  const validate = req.user.boards.filter((board) => board === req.params.id);
  if (!validate)
    return res.status(400).send({
      errMessage:
        "¡No puedes mostrar este tablero, no eres miembro ni propietario!",
    });

  const { boardId } = req.params;
  const { background, isImage } = req.body;

  await boardService.updateBackground(
    boardId,
    background,
    isImage,
    req.user,
    (err, result) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send(result);
    }
  );
};

const addMember = async (req, res) => {
  const validate = req.user.boards.filter((board) => board === req.params.id);
  if (!validate)
    return res.status(400).send({
      errMessage:
        "¡No puedes mostrar este tablero, no eres miembro ni propietario!",
    });

  const { boardId } = req.params;
  const { members } = req.body;

  await boardService.addMember(boardId, members, req.user, (err, result) => {
    if (err) return res.status(400).send(err);
    return res.status(200).send(result);
  });
};

module.exports = {
  create,
  getAll,
  getById,
  getActivityById,
  updateBoardTitle,
  updateBoardDescription,
  updateBackground,
  addMember,
};
