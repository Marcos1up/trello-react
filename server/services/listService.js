const listModel = require("../models/listModel");
const boardModel = require("../models/boardModel");
const cardModel = require("../models/cardModel");

const create = async (model, user, callback) => {
  try {
    //crear nueva lista
    const tempList = await listModel(model);
    const newList = await tempList.save();

    //obtener tablero del propietario
    const ownerBoard = await boardModel.findById(model.owner);

    //añadir la ID de NewList al tablero de propietarios
    ownerBoard.lists.push(newList.id);

    //agregar actividad creada a las actividades del tablero de propietarios
    ownerBoard.activity.unshift({
      user: user._id,
      name: user.name,
      action: `agregó ${newList.title} a este tablero.`,
      color: user.color,
    });

    ownerBoard.save();
    return callback(false, newList);
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const getAll = async (boardId, callback) => {
  try {
    //obtener listas cuyo ID de propietario es igual al parámetro boardId
    let lists = await listModel
      .find({ owner: { $in: boardId } }) //el $in se usa para buscar donde el valor de un campo coincide con los valores de un array.
      .populate({ path: "cards" }) /* { path: 'cards', select: 'title' }) */
      .exec();

    //ordenar listas
    const board = await boardModel.findById(boardId);
    let responseObject = board.lists.map((listId) => {
      return lists.filter(
        (listObject) => listObject._id.toString() === listId.toString()
      )[0];
    });

    return callback(false, responseObject);
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const deleteById = async (listId, boardId, user, callback) => {
  try {
    const board = await boardModel.findById(boardId);

    const validate = board.lists.filter((list) => list.id === listId);
    if (!validate)
      return callback({
        errMessage: "La información de la lista o del tablero es incorrecta.",
      });

    //validar si el propietario del tablero es el usuario que envió la solicitud
    if (!user.boards.filter((board) => board === boardId))
      return callback({
        errMessage:
          "No puedes eliminar una lista que no esté alojada en tus tableros.",
      });

    //borrar la lista
    const result = await listModel.findByIdAndDelete(listId);

    //borrar la lista de las listas del tablero
    board.lists = board.lists.filter((list) => list.toString() !== listId);

    //añadir actividad al log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: `eliminó ${result.title} de este tablero.`,
      color: user.color,
    });
    board.save();

    //borrar todas las cartas de la lista
    await cardModel.deleteMany({ owner: listId });

    return callback(false, result);
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateCardOrder = async (
  boardId,
  sourceId,
  destinationId,
  destinationIndex,
  cardId,
  user,
  callback
) => {
  try {
    //validar el tablero padre de las listas
    const board = await boardModel.findById(boardId);
    let validate = board.lists.filter((list) => list.id === sourceId);
    const validate2 = board.lists.filter((list) => list.id === destinationId);

    if (!validate || !validate2)
      return callback({
        errMessage: "La información de la lista o del tablero es incorrecta.",
      });

    //validar la lista de padres de la tarjeta.
    const sourceList = await listModel.findById(sourceId);
    validate = sourceList.cards.filter(
      (card) => card._id.toString() === cardId
    );

    if (!validate)
      return callback({
        errMessage: "La información de la lista o de la tarjeta es incorrecta.",
      });

    //retirar la tarjeta de la lista de fuentes y guardarla
    sourceList.cards = sourceList.cards.filter(
      (card) => card._id.toString() !== cardId
    );

    await sourceList.save();

    //insertar la tarjeta en la lista de destinos y guardar
    const card = await cardModel.findById(cardId);
    const destinationList = await listModel.findById(destinationId);

    const temp = Array.from(destinationList.cards);
    temp.splice(destinationIndex, 0, cardId);
    destinationList.cards = temp;

    await destinationList.save();

    //agregar actividad de tarjeta
    if (sourceId !== destinationId)
      card.activities.unshift({
        text: `movió esta tarjeta de ${sourceList.title} a ${destinationList.title}`,
        userName: user.name,
        color: user.color,
      });

    //cambiar propietario del tablero de la tarjeta
    card.owner = destinationId;
    await card.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateListOrder = async (
  boardId,
  sourceIndex,
  destinationIndex,
  listId,
  callback
) => {
  try {
    const board = await boardModel.findById(boardId);
    let validate = board.lists.filter((list) => list.id === listId);

    if (!validate)
      return callback({
        errMessage: "La información de la lista o de la tarjeta es incorrecta.",
      });

    //cambar el orden de las listas
    board.lists.splice(sourceIndex, 1);
    board.lists.splice(destinationIndex, 0, listId);
    await board.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateListTitle = async (listId, boardId, user, title, callback) => {
  try {
    //obtener el tablero para verificar que el padre de la lista sea este tablero
    const board = await boardModel.findById(boardId);
    const list = await listModel.findById(listId.toString());

    const validate = board.lists.filter((list) => list.id === listId);
    if (!validate)
      return callback({
        errMessage: "La información de la lista o de la tarjeta es incorrecta.",
      });

    //validar si el propietario del tablero es el usuario que envió la solicitud
    if (!user.boards.filter((board) => board === boardId))
      return callback({
        errMessage:
          "No puedes eliminar una lista que no esté alojada en tus tableros.",
      });

    //cambiar título de lista
    list.title = title;
    await list.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

module.exports = {
  create,
  getAll,
  deleteById,
  updateCardOrder,
  updateListOrder,
  updateListTitle,
};
