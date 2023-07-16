const router = require("express").Router();

const { isAuthenticated } = require("../middlewares/auth");
const usersController = require("../controllers/users");

router.get("/list", isAuthenticated, usersController.getUsers);
router.get("/me", isAuthenticated, usersController.getAuthenticatedUser);
router.get("/:id", isAuthenticated, usersController.getuserById);

module.exports = router;
