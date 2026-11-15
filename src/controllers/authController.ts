import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { handleGithubLogin } from '../services/githubAuthService';

export const publicEndpoint = (req: Request, res: Response) => {
    res.json({ message: 'Public endpoint - no authentication required' });
};

export const privateEndpoint = (req: Request, res: Response) => {
    res.json({
        message: 'Private endpoint',
        user: req.auth?.payload.sub,
    });
};

export const loginGithub = async (req: Request, res: Response) => {
    try {
        // req.auth.payload contains Auth0 user authenticated data
        const user = await handleGithubLogin(req.auth?.payload!);

        const systemJwt = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '15m' }
        );

        res.json({ token: systemJwt });
    } catch (error) {
        res.status(500).json({ error: 'Authentication exchange failed' });
    }
};