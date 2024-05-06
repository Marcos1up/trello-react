const express = require("express");
const router = express.Router();
const listController = require("../controllers/listController");

//GET /list
router.get("/:id", listController.getAll);

//POST /list
router.post("/create", listController.create);
router.post("/change-card-order", listController.updateCardOrder);
router.post("/change-list-order", listController.updateListOrder);

//PUT  /list
router.put("/:boardId/:listId/update-title", listController.updateListTitle);

//DELETE /list
router.delete("/:boardId/:listId", listController.deleteById);

module.exports = router;
