import { Router } from "express";
import { checkJwt } from "../middleware/authMiddleware";
import { loginGithub, privateEndpoint, publicEndpoint } from "../controllers/authController";

const router = Router();

router.get('/public', publicEndpoint);
router.get('/private', checkJwt, privateEndpoint);
// Auth0 protected route that changes the Auth0 token for our system's token
router.post('/auth/exchange', checkJwt, loginGithub);

export default router;