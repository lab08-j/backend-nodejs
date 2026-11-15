import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { auth, requiredScopes, UnauthorizedError } from 'express-oauth2-jwt-bearer';
import { handleGithubLogin } from './services/githubAuthService';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 3001;

const checkJwt = auth({
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    audience: process.env.AUTH0_AUDIENCE,
});

app.get('/api/public', (req: Request, res: Response) => {
    res.json({ message: 'Public endpoint - no authentication required' });
});

app.get('/api/private', checkJwt, (req: Request, res: Response) => {
    res.json({
        message: 'Private endpoint',
        user: req.auth?.payload.sub,
    });
});

// Auth0 protected route that changes the Auth0 token for our system's token
app.post('/api/auth/exchange', checkJwt, async (req: Request, res: Response) => {
    try {
        // req.auth.payload contains Auth0 user authenticated data
        const user = await handleGithubLogin(req.auth?.payload!);

        const systemJwt = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );

        res.json({ token: systemJwt });
    } catch (error) {
        res.status(500).json({ error: 'Authentication exchange failed' });
    }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof UnauthorizedError) {
        res.status(err.status).set(err.headers).json({
            error: err.code || 'unauthorized',
            message: 'Authentication required',
        });
    } else {
        res.status(500).json({
            error: 'server_error',
            message: 'Internal Server Error',
        });
    }
});

app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});