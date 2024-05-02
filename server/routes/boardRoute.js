const boardController = require("../controllers/boardController");
const express = require("express");
const route = express.Router();

//POST /board
route.post("/create", boardController.create);
route.post("/:boardId/add-member", boardController.addMember);

//PUT /board
route.put("/:boardId/update-board-title", boardController.updateBoardTitle);
route.put(
  "/:boardId/update-board-description",
  boardController.updateBoardDescription
);
route.put("/:boardId/update-background", boardController.updateBackground);

//GET /board
route.get("/", boardController.getAll);
route.get("/:id", boardController.getById);
route.get("/:id/activity", boardController.getActivityById);

module.exports = route;
