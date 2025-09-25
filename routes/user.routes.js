const express = require('express');
const router = express.Router();
const { body } = require("express-validator");

const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// ===================== REGISTER =====================
router.post(
    '/register',
    upload.single('aadharFile'), // Handle file upload (multer)
    [
        body('email')
            .isEmail()
            .withMessage('Invalid email'),

        body('firstname')
            .isLength({ min: 3 })
            .withMessage('First name must be at least 3 characters long. jj'),

        body('lastname')
            .isLength({ min: 2 })
            .withMessage('Last name must be at least 2 characters long'),

        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),

        // Optional partner fields
        body('categories')
            .optional()
            .isArray()
            .withMessage('Categories must be an array'),

        body('priceRange')
            .optional()
            .isIn(['a', 'b', 'c', 'd', 'e'])
            .withMessage('Invalid price range'),

        body('phone')
            .optional()
            .isMobilePhone()
            .withMessage('Invalid phone number'),

        body('portfolioUrl')
            .optional()
            .isURL()
            .withMessage('Invalid portfolio URL'),
    ],
    userController.registerUser
);

// ===================== LOGIN =====================
router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Invalid email'),

        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ],
    userController.loginUser
);

// ===================== PROFILE =====================
router.get(
    '/profile',
    authMiddleware.authUser,
    userController.getUserProfile
);

// ===================== LOGOUT =====================
router.get(
    '/logout',
    authMiddleware.authUser,
    userController.logoutUser
);

module.exports = router;
