import { Router, Request, Response, NextFunction } from 'express';

import { auth } from 'express-oauth2-jwt-bearer';
var router = Router();

// Middleware JWT
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: process.env.AUTH0_TOKEN_SIGNING_ALG,
});

router.get('/', jwtCheck, function (req: Request<{}, {}, {}>, res: Response, next: NextFunction) {
  res.json({
    title: 'Auth0 Webapp sample Nodejs',
    isAuthenticated: true,
  });
});

router.get('/profile', jwtCheck, function (req: Request<{}, {}, {}>, res: Response, next: NextFunction) {
  res.json({
    userProfile: "NAme",
    title: 'Profile page'
  });
});

export default router;
