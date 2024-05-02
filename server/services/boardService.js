const boardModel = require("../models/boardModel");
const userModel = require("../models/userModel");
//const { findOne } = require("../models/boardModel");

const create = async (req, callback) => {
  try {
    const { title, backgroundImageLink, members } = req.body;

    //crea tablero nuevo
    let newBoard = boardModel({ title, backgroundImageLink });
    newBoard.save();

    //añade este tablero a los tableros de su creador
    const user = await userModel.findById(req.user.id);
    user.boards.unshift(newBoard.id);
    await user.save();

    //agrega usuario a los miembros de este tablero
    let allMembers = [];
    allMembers.push({
      user: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      color: user.color,
      role: "owner",
    });

    //guarda la identificación de newBoard en los tableros de miembros y agrega identificaciones de miembros a newBoard
    await Promise.all(
      members.map(async (member) => {
        const newMember = await userModel.findOne({ email: member.email });
        newMember.boards.push(newBoard._id);
        await newMember.save();
        allMembers.push({
          user: newMember._id,
          name: newMember.name,
          surname: newMember.surname,
          email: newMember.email,
          color: newMember.color,
          role: "member",
        });

        //ñade a la actividad del tablero
        newBoard.activity.push({
          user: user.id,
          name: user.name,
          action: `Usuario '${newMember.name}' añadido a este tablero.`,
        });
      })
    );

    //agrega actividad creada a las actividades de este tablero
    newBoard.activity.unshift({
      user: user._id,
      name: user.name,
      action: "Creó este tablero",
      color: user.color,
    });

    //guarda nuevo tablero
    newBoard.members = allMembers;
    await newBoard.save();

    return callback(false, newBoard);
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const getAll = async (userId, callback) => {
  try {
    const user = await userModel.findById(userId);
    const boardIds = user.boards;

    const boards = await boardModel.find({ _id: { $in: boardIds } });

    //borrar objetos innecesarios
    boards.forEach((board) => {
      board.activity = undefined;
      board.lists = undefined;
    });

    return callback(false, boards);
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const getById = async (id, callback) => {
  try {
    const board = await boardModel.findById(id);
    return callback(false, board);
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const getActivityById = async (id, callback) => {
  try {
    const board = await boardModel.findById(id);
    return callback(false, board.activity);
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateBoardTitle = async (boardId, title, user, callback) => {
  try {
    const board = await boardModel.findById(boardId);

    //setear el titulo
    board.title = title;

    //actualizacion del tablero pisando valores anteriores
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: "actualizar el título de este tablero",
      color: user.color,
    });

    //guarda los cambios
    await board.save();
    return callback(false, { message: "¡Título actualizado con éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateBoardDescription = async (boardId, description, user, callback) => {
  try {
    const board = await boardModel.findById(boardId);

    board.description = description;

    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: "actualizar la descripción de este tablero",
      color: user.color,
    });

    await board.save();
    return callback(false, { message: "¡Descripción actualizada con éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateBackground = async (id, background, isImage, user, callback) => {
  try {
    const board = await boardModel.findById(id);

    board.backgroundImageLink = background;
    board.isImage = isImage;

    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: "actualizar el background de este tablero",
      color: user.color,
    });

    await board.save();
    return callback(false, board);
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const addMember = async (id, members, user, callback) => {
  try {
    const board = await boardModel.findById(id);

    //setear variables
    await Promise.all(
      members.map(async (member) => {
        const newMember = await userModel.findOne({ email: member.email });
        newMember.boards.push(board._id);
        await newMember.save();

        board.members.push({
          user: newMember._id,
          name: newMember.name,
          surname: newMember.surname,
          email: newMember.email,
          color: newMember.color,
          role: "member",
        });

        //añadir a la actividad del tablero
        board.activity.push({
          user: user.id,
          name: user.name,
          action: `'${newMember.name}' añadido a este tablero.`,
          color: user.color,
        });
      })
    );

    await board.save();
    return callback(false, board.members);
  } catch (error) {
    return callback({
      message: "Algo salió mal.",
      details: error.message,
    });
  }
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
