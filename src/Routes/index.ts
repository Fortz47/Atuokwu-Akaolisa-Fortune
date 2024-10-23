import { Router } from "express";
import { body } from "express-validator";


export const router = Router();

const registerValidationRules = [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Insert valid password')
]

// AUTH API
router.post('/register', registerValidationRules, AuthController.register);
router.post('/login', registerValidationRules, AuthController.login);
router.get('/logout', jwtGuard, AuthController.logout);