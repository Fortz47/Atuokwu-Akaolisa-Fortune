import { Router } from "express";
import { body } from "express-validator";
import AuthController from "../Controllers/AuthController";
import { jwtGuard } from "../Utils/jwtGuard";


export const userRouter = Router();

const registerValidationRules = [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Insert valid password')
]

// AUTH API
userRouter.post('/register', registerValidationRules, AuthController.register);
userRouter.post('/login', registerValidationRules, AuthController.login);
userRouter.get('/logout', jwtGuard, AuthController.logout);