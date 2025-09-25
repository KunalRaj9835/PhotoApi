const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const partnerController = require("../controllers/partner.controller");
const { authPartner } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// ✅ Register Partner with validation
router.post(
  "/register",
  upload.fields([
    { name: "aadharFile", maxCount: 1 },
    { name: "portfolioFile", maxCount: 1 },
  ]),
  [
    // Validation rules for registration
    body("firstName")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 character long")
      .trim(),
    body("lastName")
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long")
      .trim(),
    body("email")
      .isEmail()
      .withMessage("Invalid Email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 character long"),
    body("phone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Invalid phone number"),
    body("categories")
      .optional()
      .isArray()
      .withMessage("Categories must be an array"),
    body("priceRange")
      .isIn(["a", "b", "c", "d", "e"])
      .withMessage("Invalid price range"),
  ],
  partnerController.registerPartner
);

// ✅ Login Partner
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 6 }).withMessage("Password too short"),
  ],
  partnerController.loginPartner
);

// ✅ Profile
router.get("/profile", authPartner, partnerController.getPartnerProfile);

// ✅ Logout
router.get("/logout", authPartner, partnerController.logoutPartner);

module.exports = router;