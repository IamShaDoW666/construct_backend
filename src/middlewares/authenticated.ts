import { sendError } from '../utils/network';
import type { UserAuth } from '../types';
import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include a user property
declare global {
    namespace Express {
        interface Request {
            user?: UserAuth; // Replace 'any' with the appropriate type if known
        }
    }
}

import jwt from 'jsonwebtoken';

const authenticated = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {        
        sendError(res, 'Unauthorized', 401);
        return
    }

    const token = authHeader.split(' ')[1];        
    try {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error('JWT secret key is not defined');
        }

        const decoded = jwt.verify(token, secretKey);
        req.user = decoded as UserAuth; // Attach decoded token payload to the request object
        next();
    } catch (error) {        
        console.log('Error verifying token:', error);
        sendError(res, 'Unauthorized', 401);
        return;
    }
};

export default authenticated;