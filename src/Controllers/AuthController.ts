import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { createSecretKey } from 'crypto';
import { SignJWT } from 'jose';
import UserService from '../Services/UserService';
import { JWT_SECRET } from '../Configs/secrets';
import { getToken } from '../Utils/jwtGuard';
import redisClient from '../Storage/redis';
import { parseTime } from '../Utils/utils';
import { Icredentials } from '../Utils/interface';


class AuthControlller {
  static async register(req: Request, res: Response) {
    if (!validateCredentials(req, res)) return;

    const { email, password } = req.body;
    const user = await UserService.getUser(email);
    if (user) {
      res.status(409).json({ error: 'Email already in use.' })
      return;
    }

    const newUser = await UserService.createUser({ email, password });
    if (!newUser) {
      const error = 'An unexpected error occurred. Please try again later.';
      return res.status(500).json({ error });
    }

    res.json({ msg: 'Success.' });
  }

  static async login(req: Request, res: Response) {
    const isLoggedIn = await getToken(req, res);
    if (isLoggedIn) {
      return res.json({ msg: 'Already Logged in.' });
    }

    if (!validateCredentials(req, res)) return;

    const { email, username, password } = req.body;
    const emailOrUsername = email || username;
    const credentials: Icredentials = { emailOrUsername, password };
    const validUser = await UserService.validateUser(credentials);
    if (!validUser) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }
    const userId = validUser._id.toString();
    const token = await generateToken(userId, validUser.email);

    res.json({ msg: 'Login successful.', token });
  }

  static async loginAdmin(req: Request, res: Response) {
    const payload = await getToken(req, res);
    if (payload && payload.role === 'admin') {
      return res.json({ msg: 'Already Logged in.' });
    }

    if (!validateCredentials(req, res)) return;

    const { email, username, password } = req.body;
    const emailOrUsername = email || username;
    const credentials: Icredentials = { emailOrUsername, password };
    const validUser = await UserService.validateUser(credentials);
    if (!validUser) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (validUser.role !== 'admin') {
      return res.status(401).json({ error: 'Admin only.' });
    }
    const userId = validUser._id.toString();
    const token = await generateToken(userId, validUser.email, 'admin');

    res.json({ msg: 'Login successful.', token });
  }

  // must be a protected route, jwtGuard
  static async logout(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    try {
      await removeToken(token);
    } catch (error) {
      const msg = 'An unexpected error occurred. Please try again later';
      return res.status(500).json({ error: msg })
    }
    res.json({ msg: 'Logout succesful.' });
  }
}

// validate request body
function validateCredentials(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.statusCode = 400;
    res.json({ errors: errors.array() });
    return false;
  }
  return true;
}

// generate JWT token
async function generateToken(id: string, email: string, role?: 'user' | 'admin') {
  let expTime = '30 min';
  if (!role) {
    role = 'user';
    expTime = '2 days';
  }
  const secret = createSecretKey(Buffer.from(JWT_SECRET, 'utf-8'));
  const payload = { id, email, role };
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expTime)
    .sign(secret);

  const EXP = parseTime(expTime); // convert to seconds in with type 'number'
  await cacheToken(token, id, EXP);
  return token;
}

async function cacheToken(token: string, userId: string, exp: number) {
  const key = `auth_${token}`;
  await redisClient.set(key, userId, exp);
}

async function removeToken(token: string) {
  const key = `auth_${token}`;
  await redisClient.del(key);
}

export default AuthControlller;