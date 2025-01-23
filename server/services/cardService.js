const cardModel = require("../models/cardModel");
const listModel = require("../models/listModel");
const boardModel = require("../models/boardModel");
const userModel = require("../models/userModel");
const helperMethods = require("./helperMethods");

const create = async (title, listId, boardId, user, callback) => {
  try {
    //obtener lista y tablero
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    //validar la propiedad
    const validate = await helperMethods.validateCardOwners(
      null,
      list,
      board,
      user,
      true
    );
    if (!validate)
      return callback({
        errMessage:
          "No tienes permiso para agregar una tarjeta a esta lista o tablero.",
      });

    //nueva card
    const card = await cardModel({ title: title });
    card.owner = listId;
    card.activities.unshift({
      text: `Agregué esta tarjeta a ${list.title}`,
      userName: user.name,
      color: user.color,
    });
    card.labels = helperMethods.labelsSeed;
    await card.save();

    //agregar identificación de la nueva card a la lista de propietarios
    list.cards.push(card._id);
    await list.save();

    //log activity
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: `agregó ${card.title} a este tablero`,
      color: user.color,
    });
    await board.save();

    //setear objeto de transferencia de datos
    const result = await listModel
      .findById(listId)
      .populate({ path: "cards" })
      .exec();
    return callback(false, result);
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const deleteById = async (cardId, listId, boardId, user, callback) => {
  try {
    //modelos
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    //validar propietario
    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //borrar card
    const result = await cardModel.findByIdAndDelete(cardId);

    //eliminar la lista de las listas de tablero
    list.cards = list.cards.filter(
      (tempCard) => tempCard.toString() !== cardId
    );
    await list.save();

    //activity log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: `eliminado ${result.title} de ${list.title}`,
      color: user.color,
    });
    await board.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const getCard = async (cardId, listId, boardId, user, callback) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    //validar propietario
    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    let returnObject = {
      ...card._doc,
      listTitle: list.title,
      listId: listId,
      boardId: boardId,
    };

    return callback(false, returnObject);
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const update = async (cardId, listId, boardId, user, updatedObj, callback) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //actualizar card
    await card.updateOne(updatedObj);
    await card.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const addComment = async (cardId, listId, boardId, user, body, callback) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //añadir comentario
    card.activities.unshift({
      text: body.text,
      userName: user.name,
      isComment: true,
      color: user.color,
    });
    await card.save();

    //activity log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: body.text,
      actionType: "comment",
      cardTitle: card.title,
      color: user.color,
    });
    board.save();

    return callback(false, card.activities);
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateComment = async (
  cardId,
  listId,
  boardId,
  commentId,
  user,
  body,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //actualizar card
    card.activities = card.activities.map((activity) => {
      if (activity._id.toString() === commentId.toString()) {
        if (activity.userName !== user.name) {
          return callback({
            errMessage: "No puedes editar el comentario que no tienes.",
          });
        }
        activity.text = body.text;
      }
      return activity;
    });
    await card.save();

    //activity log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: body.text,
      actionType: "comment",
      edited: true,
      color: user.color,
      cardTitle: card.title,
    });
    board.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const deleteComment = async (
  cardId,
  listId,
  boardId,
  commentId,
  user,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //borrar card
    card.activities = card.activities.filter(
      (activity) => activity._id.toString() !== commentId.toString()
    );
    await card.save();

    //activity log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: `eliminó su propio comentario de ${card.title}`,
      color: user.color,
    });
    board.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const addMember = async (cardId, listId, boardId, user, memberId, callback) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);
    const member = await userModel.findById(memberId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    card.members.unshift({
      user: member._id,
      name: member.name,
      color: member.color,
    });
    await card.save();

    //activity log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: `agregó '${member.name}' a ${card.title}`,
      color: user.color,
    });
    board.save();
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const deleteMember = async (
  cardId,
  listId,
  boardId,
  user,
  memberId,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    card.members = card.members.filter(
      (a) => a.user.toString() !== memberId.toString()
    );
    await card.save();

    const tempMember = await userModel.findById(memberId);

    //activity log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action:
        tempMember.name === user.name
          ? `dejó ${card.title}`
          : `eliminado '${tempMember.name}' de ${card.title}`,
      color: user.color,
    });
    board.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const createLabel = async (cardId, listId, boardId, user, label, callback) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //activity log
    card.labels.unshift({
      text: label.text,
      color: label.color,
      backcolor: label.backColor,
      selected: true,
    });
    await card.save();

    const labelId = card.labels[0]._id;

    return callback(false, { labelId: labelId });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateLabel = async (
  cardId,
  listId,
  boardId,
  labelId,
  user,
  label,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //actualizar label
    card.labels = card.labels.map((item) => {
      if (item._id.toString() === labelId.toString()) {
        item.text = label.text;
        item.color = label.color;
        item.backColor = label.backColor;
      }
      return item;
    });
    await card.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const deleteLabel = async (
  cardId,
  listId,
  boardId,
  labelId,
  user,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //borrar label
    card.labels = card.labels.filter(
      (label) => label._id.toString() !== labelId.toString()
    );
    await card.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateLabelSelection = async (
  cardId,
  listId,
  boardId,
  labelId,
  user,
  selected,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //actualizar label
    card.labels = card.labels.map((item) => {
      if (item._id.toString() === labelId.toString()) {
        item.selected = selected;
      }
      return item;
    });
    await card.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const createChecklist = async (
  cardId,
  listId,
  boardId,
  user,
  title,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    card.checklists.push({
      title: title,
    });
    await card.save();

    const checklistId = card.checklists[card.checklists.length - 1]._id;

    //activity log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: `agregó '${title}' a ${card.title}`,
      color: user.color,
    });
    board.save();

    return callback(false, { checklistId: checklistId });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const deleteChecklist = async (
  cardId,
  listId,
  boardId,
  checklistId,
  user,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    let cl = card.checklists.filter(
      (l) => l._id.toString() === checklistId.toString()
    );

    //borrar checklist
    card.checklists = card.checklists.filter(
      (list) => list._id.toString() !== checklistId.toString()
    );
    await card.save();

    //activity log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: `eliminó '${cl.title}' de ${card.title}`,
      color: user.color,
    });
    board.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const addChecklistItem = async (
  cardId,
  listId,
  boardId,
  user,
  checklistId,
  text,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //añadir checklistItem
    card.checklists = card.checklists.map((list) => {
      if (list._id.toString() == checklistId.toString()) {
        list.items.push({ text: text });
      }
      return list;
    });
    await card.save();

    //conseguir a la ID del ChecklistItem creado
    let checklistItemId = "";
    card.checklists = card.checklists.map((list) => {
      if (list._id.toString() == checklistId.toString()) {
        checklistItemId = list.items[list.items.length - 1]._id;
      }
      return list;
    });
    return callback(false, { checklistItemId: checklistItemId });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const setChecklistItemCompleted = async (
  cardId,
  listId,
  boardId,
  user,
  checklistId,
  checklistItemId,
  completed,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    let clItem = "";

    //actualización completada de checklistItem
    card.checklists = card.checklists.map((list) => {
      if (list._id.toString() == checklistId.toString()) {
        list.items = list.items.map((item) => {
          if (item._id.toString() === checklistItemId) {
            item.completed = completed;
            clItem = item.text;
          }
          return item;
        });
      }
      return list;
    });
    await card.save();

    //activity log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: completed
        ? `completó '${clItem}' en ${card.title}`
        : `marcó como incompleto en '${clItem}' en ${card.title}`,
      color: user.color,
    });
    board.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const setChecklistItemText = async (
  cardId,
  listId,
  boardId,
  user,
  checklistId,
  checklistItemId,
  text,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //actualizar el texto de checklistItem
    card.checklists = card.checklists.map((list) => {
      if (list._id.toString() == checklistId.toString()) {
        list.items = list.items.map((item) => {
          if (item._id.toString() === checklistItemId) {
            item.text = text;
          }
          return item;
        });
      }
      return list;
    });
    await card.save();
    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const deleteChecklistItem = async (
  cardId,
  listId,
  boardId,
  user,
  checklistId,
  checklistItemId,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //borrar checklistItem
    card.checklists = card.checklists.map((list) => {
      if (list._id.toString() == checklistId.toString()) {
        list.items = list.items.filter(
          (item) => item._id.toString() !== checklistItemId
        );
      }
      return list;
    });
    await card.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateStartDueDates = async (
  cardId,
  listId,
  boardId,
  user,
  startDate,
  dueDate,
  dueTime,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //actualizar fechas
    card.date.startDate = startDate;
    card.date.dueDate = dueDate;
    card.date.dueTime = dueTime;
    if (dueDate === null) card.date.completed = false;
    await card.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateDateCompleted = async (
  cardId,
  listId,
  boardId,
  user,
  completed,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //actualizar fecha del evento completado
    card.date.completed = completed;
    await card.save();

    //activity log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: `marcó la fecha de vencimiento en ${card.title} ${
        completed ? "completo" : "incompleto"
      }`,
      color: user.color,
    });
    board.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const addAttachment = async (
  cardId,
  listId,
  boardId,
  user,
  link,
  name,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //añadir attachment
    //expresión regular para verificar si el enlace comienza con 'http://' o 'https://'
    const validLink = new RegExp(/^https?:\/\//).test(link)
      ? link
      : "http://" + link;

    card.attachments.push({ link: validLink, name: name });
    await card.save();

    //activity log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: `adjuntó ${validLink} a ${card.title}`,
      color: user.color,
    });
    board.save();

    return callback(false, {
      attachmentId:
        card.attachments[card.attachments.length - 1]._id.toString(),
    });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const deleteAttachment = async (
  cardId,
  listId,
  boardId,
  user,
  attachmentId,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    let attachmentObj = card.attachments.filter(
      (attachment) => attachment._id.toString() === attachmentId.toString()
    );

    //borrar checklistItem
    card.attachments = card.attachments.filter(
      (attachment) => attachment._id.toString() !== attachmentId.toString()
    );
    await card.save();

    //activity log
    board.activity.unshift({
      user: user._id,
      name: user.name,
      action: `eliminó el archivo adjunto ${attachmentObj[0].link} de ${card.title}`,
      color: user.color,
    });
    board.save();

    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateAttachment = async (
  cardId,
  listId,
  boardId,
  user,
  attachmentId,
  link,
  name,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //actualizar fecha de finalización del evento
    card.attachments = card.attachments.map((attachment) => {
      if (attachment._id.toString() === attachmentId.toString()) {
        attachment.link = link;
        attachment.name = name;
      }
      return attachment;
    });

    await card.save();
    return callback(false, { message: "¡Éxito!" });
  } catch (error) {
    return callback({
      errMessage: "Algo salió mal.",
      details: error.message,
    });
  }
};

const updateCover = async (
  cardId,
  listId,
  boardId,
  user,
  color,
  isSizeOne,
  callback
) => {
  try {
    const card = await cardModel.findById(cardId);
    const list = await listModel.findById(listId);
    const board = await boardModel.findById(boardId);

    const validate = await helperMethods.validateCardOwners(
      card,
      list,
      board,
      user,
      false
    );
    if (!validate)
      return {
        errMessage: "No tienes los permisos necesarios.",
      };

    //actualizar color de portada de fecha
    card.cover.color = color;
    card.cover.isSizeOne = isSizeOne;

    await card.save();
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
  deleteById,
  getCard,
  update,
  addComment,
  updateComment,
  deleteComment,
  addMember,
  deleteMember,
  createLabel,
  updateLabel,
  deleteLabel,
  updateLabelSelection,
  createChecklist,
  deleteChecklist,
  addChecklistItem,
  setChecklistItemCompleted,
  setChecklistItemText,
  deleteChecklistItem,
  updateStartDueDates,
  updateDateCompleted,
  addAttachment,
  deleteAttachment,
  updateAttachment,
  updateCover,
};
