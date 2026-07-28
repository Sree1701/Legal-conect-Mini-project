const express = require("express");
const router = express.Router();
const { getAdvocates } = require("../controllers/userController");

router.get("/advocates", getAdvocates);

module.exports = router;
