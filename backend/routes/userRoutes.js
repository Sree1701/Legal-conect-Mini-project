const express = require("express");
const router = express.Router();
const {
    getAdvocates,
    updateAdvocateProfile,
    getAdvocateSlots,
    addAdvocateSlot,
    autoGenerateSlots,
    deleteAdvocateSlot,
} = require("../controllers/userController");

router.get("/advocates", getAdvocates);
router.put("/profile/:id", updateAdvocateProfile);

router.get("/slots/:id", getAdvocateSlots);
router.post("/slots/:id/add", addAdvocateSlot);
router.post("/slots/:id/generate", autoGenerateSlots);
router.delete("/slots/:id/:slotId", deleteAdvocateSlot);

module.exports = router;
