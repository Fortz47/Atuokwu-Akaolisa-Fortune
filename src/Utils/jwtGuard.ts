import { createSecretKey } from "crypto";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../Configs/secrets";
import { jwtVerify } from "jose";
import redisClient from "../Storage/redis";


async function verifyToken(req: Request, res: Response) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const key = `auth_${token}`;
    const hasKey = await redisClient.get(key);
    if (!hasKey) return null;

    try {
      const secret = createSecretKey(Buffer.from(JWT_SECRET, 'utf-8'));
      const { payload } = await jwtVerify(token, secret);
      // @ts-ignore
      req.user = payload;
      // @ts-ignore
      return payload;
    } catch (error) {
      throw new Error(error);
    }
  }
  return null;
}

async function getToken(req: Request, res: Response) {
  try {
    const payload = await verifyToken(req, res);
    return payload;
  } catch (error) {
    // pass
  }
  return null;
}

async function jwtGuard(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const key = `auth_${token}`;
    const hasKey = await redisClient.get(key);
    if (!hasKey) return res.status(401).json({ error: 'Unauthorized: invalid token.' });
    try {
      const secret = createSecretKey(Buffer.from(JWT_SECRET, 'utf-8'));
      const { payload } = await jwtVerify(token, secret);
      // @ts-ignore
      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({ error: `Unauthorized: ${error.message}` });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized.' });
  }
}

export { jwtGuard, getToken };