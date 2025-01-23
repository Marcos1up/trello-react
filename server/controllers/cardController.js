const cardService = require("../services/cardService");

const create = async (req, res) => {
  const { title, listId, boardId } = req.body;
  const user = req.user;

  if (!(title, listId, boardId))
    return res.status(400).send({
      errMessage:
        "La operación de creación no se pudo completar porque falta información.",
    });

  await cardService.create(title, listId, boardId, user, (err, result) => {
    if (err) return res.status(500).send(err);
    return res.status(201).send(result);
  });
};

const deleteById = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const user = req.user;

  await cardService.deleteById(cardId, listId, boardId, user, (err, result) => {
    if (err) return res.status(500).send(err);
    return res.status(200).send(result);
  });
};

const getCard = async (req, res) => {
  const user = req.user;
  const { boardId, listId, cardId } = req.params;

  await cardService.getCard(cardId, listId, boardId, user, (err, result) => {
    if (err) return res.status(500).send(err);
    return res.status(200).send(result);
  });
};

const update = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const user = req.user;

  await cardService.update(
    cardId,
    listId,
    boardId,
    user,
    req.body,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const addComment = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const user = req.user;

  await cardService.addComment(
    cardId,
    listId,
    boardId,
    user,
    req.body,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const updateComment = async (req, res) => {
  const { boardId, listId, cardId, commentId } = req.params;
  const user = req.user;

  await cardService.updateComment(
    cardId,
    listId,
    boardId,
    commentId,
    user,
    req.body,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const deleteComment = async (req, res) => {
  const { boardId, listId, cardId, commentId } = req.params;
  const user = req.user;

  await cardService.deleteComment(
    boardId,
    listId,
    cardId,
    commentId,
    user,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const addMember = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const user = req.user;

  await cardService.addMember(
    cardId,
    listId,
    boardId,
    user,
    req.body.memberId,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const deleteMember = async (req, res) => {
  const { boardId, listId, cardId, memberId } = req.params;
  const user = req.user;

  await cardService.deleteComment(
    cardId,
    listId,
    boardId,
    user,
    memberId,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const createLabel = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const label = req.body;
  const user = req.user;

  await cardService.createLabel(
    cardId,
    listId,
    boardId,
    user,
    label,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const updateLabel = async (req, res) => {
  const { boardId, listId, cardId, labelId } = req.params;
  const label = req.body;
  const user = req.user;

  await cardService.updateLabel(
    cardId,
    listId,
    boardId,
    labelId,
    user,
    label,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const deleteLabel = async (req, res) => {
  const { boardId, listId, cardId, labelId } = req.params;
  const user = req.user;

  await cardService.deleteLabel(
    cardId,
    listId,
    boardId,
    labelId,
    user,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const updateLabelSelection = async (req, res) => {
  const { boardId, listId, cardId, labelId } = req.params;
  const { selected } = req.body;
  const user = req.user;

  await cardService.updateLabelSelection(
    cardId,
    listId,
    boardId,
    labelId,
    user,
    selected,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const createChecklist = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const title = req.body.title;
  const user = req.user;

  await cardService.createChecklist(
    cardId,
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

const deleteChecklist = async (req, res) => {
  const { boardId, listId, cardId, checklistId } = req.params;
  const user = req.user;

  await cardService.deleteChecklist(
    cardId,
    listId,
    boardId,
    checklistId,
    user,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const addChecklistItem = async (req, res) => {
  const { boardId, listId, cardId, checklistId } = req.params;
  const text = req.body.text;
  const user = req.user;

  await cardService.addChecklistItem(
    cardId,
    listId,
    boardId,
    user,
    checklistId,
    text,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const setChecklistItemCompleted = async (req, res) => {
  const { boardId, listId, cardId, checklistId, checklistItemId } = req.params;
  const completed = req.body.completed;
  const user = req.user;

  await cardService.setChecklistItemCompleted(
    cardId,
    listId,
    boardId,
    user,
    checklistId,
    checklistItemId,
    completed,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const setChecklistItemText = async (req, res) => {
  const { boardId, listId, cardId, checklistId, checklistItemId } = req.params;
  const text = req.body.text;
  const user = req.user;

  await cardService.setChecklistItemText(
    cardId,
    listId,
    boardId,
    user,
    checklistId,
    checklistItemId,
    text,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const deleteChecklistItem = async (req, res) => {
  const { boardId, listId, cardId, checklistId, checklistItemId } = req.params;
  const user = req.user;

  await cardService.deleteChecklistItem(
    cardId,
    listId,
    boardId,
    user,
    checklistId,
    checklistItemId,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const updateStartDueDates = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const { startDate, dueDate, dueTime } = req.body;
  const user = req.user;

  await cardService.updateStartDueDates(
    cardId,
    listId,
    boardId,
    user,
    startDate,
    dueDate,
    dueTime,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const updateDateCompleted = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const { completed } = req.body;
  const user = req.user;

  await cardService.updateDateCompleted(
    cardId,
    listId,
    boardId,
    user,
    completed,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const addAttachment = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const { link, name } = req.body;
  const user = req.user;

  await cardService.addAttachment(
    cardId,
    listId,
    boardId,
    user,
    link,
    name,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const deleteAttachment = async (req, res) => {
  const { boardId, listId, cardId, attachmentId } = req.params;
  const user = req.user;

  await cardService.deleteAttachment(
    cardId,
    listId,
    boardId,
    user,
    attachmentId,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const updateAttachment = async (req, res) => {
  const { boardId, listId, cardId, attachmentId } = req.params;
  const { link, name } = req.body;
  const user = req.user;

  await cardService.updateAttachment(
    cardId,
    listId,
    boardId,
    user,
    attachmentId,
    link,
    name,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
};

const updateCover = async (req, res) => {
  const { boardId, listId, cardId } = req.params;
  const { color, isSizeOne } = req.body;
  const user = req.user;

  await cardService.updateCover(
    cardId,
    listId,
    boardId,
    user,
    color,
    isSizeOne,
    (err, result) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(result);
    }
  );
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
