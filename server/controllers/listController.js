const listService = require("../services/listService");

const create = async (req, res) => {
  const { title, boardId } = req.body;

  if (!(title && boardId))
    return res
      .status(400)
      .send({ errMessage: "El título no puede estar vacío." });

  const validate = req.user.boards.filter((board) => board === boardId);
  if (!validate)
    return res.status(400).send({
      errMessage:
        "¡No puedes agregar una lista al tablero, no eres miembro ni propietario!",
    });

  await listService.create(
    { title: title, owner: boardId },
    req.user,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(201).send(result);
    }
  );
};

const getAll = async (req, res) => {
  const boardId = req.params.id;

  const validate = req.user.boards.filter((board) => board === boardId);
  if (!validate)
    return res.status(400).send({
      errMessage:
        "¡No puedes obtener listas porque no eres el propietario de estas listas!",
    });

  await listService.getAll(boardId, (err, result) => {
    if (err) return res.status(500).send(err);
    return res.status(200).send(result);
  });
};

const deleteById = async (req, res) => {
  const { listId, boardId } = req.params;
  const user = req.user;

  if (!(listId && boardId))
    return res.status(400).send({ errMessage: "Lista o tablero no definido" });

  await listService.deleteById(listId, boardId, user, (err, result) => {
    if (err) return res.status(500).send(err);
    return res.status(200).send(result);
  });
};

const updateCardOrder = async (req, res) => {
  const { boardId, sourceId, destinationId, destinationIndex, cardId } =
    req.body;
  const user = req.user;

  if (!(boardId && sourceId && destinationId && cardId))
    return res
      .status(400)
      .send({ errMessage: "No fueron proporcionados todos los parámetros." });

  const validate = user.boards.filter((board) => board === boardId);
  if (!validate)
    return res
      .status(403)
      .send({ errMessage: "No puedes editar el tablero que no tienes." });

  await listService.updateCardOrder(
    boardId,
    sourceId,
    destinationId,
    destinationIndex,
    cardId,
    user,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const updateListOrder = async (req, res) => {
  const { boardId, sourceIndex, destinationIndex, listId } = req.body;
  const user = req.user;

  if (
    !(
      boardId &&
      sourceIndex != undefined &&
      destinationIndex != undefined &&
      listId
    )
  )
    return res
      .status(400)
      .send({ errMessage: "No fueron proporcionados todos los parámetros." });

  const validate = user.boards.filter((board) => board === boardId);
  if (!validate)
    return res
      .status(403)
      .send({ errMessage: "No puedes editar el tablero que no tienes." });

  await listService.updateListOrder(
    boardId,
    sourceIndex,
    destinationIndex,
    listId,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const updateListTitle = async (req, res) => {
  const { listId, boardId } = req.params;
  const user = req.user;
  const { title } = req.body;

  if (!(listId && boardId))
    return res.status(400).send({ errMessage: "Lista o tablero no definido" });

  await listService.updateListTitle(
    listId,
    boardId,
    user,
    title,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

module.exports = {
  create,
  getAll,
  deleteById,
  updateCardOrder,
  updateListOrder,
  updateListTitle,
};
