const express = require("express");
const { ajouterProspect } = require("../controllers/prospectController");

const router = express.Router();

router.post("/prospects", ajouterProspect);

module.exports = router;
