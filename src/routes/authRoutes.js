const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { validate } = require('../middleware/validate');
const { loginSchema, registerSchema } = require('../schemas/authSchemas');
const asyncHandler = require('../middleware/asyncHandler');

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));

module.exports = router;