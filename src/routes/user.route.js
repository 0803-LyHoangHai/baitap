const express = require("express");
const upload = require("../middlewares/upload.middleware");
const { importUsers } = require("../controllers/user.controller");

const router = express.Router();

router.post("/import", upload.single("file"), importUsers);

module.exports = router;