import { Router, Request, Response, NextFunction } from 'express';
import { requiresAuth } from 'express-openid-connect';

import { auth } from 'express-oauth2-jwt-bearer';
var router = Router();

console.log({

  issuerBaseURL: "https://rafaesc.auth0.com/api/v2/",
  audience: process.env.AUTH0_CLIENT_ID
})

const checkJwt = auth({

  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  audience: "https://rafaesc.auth0.com/api/v2/"
});

router.get('/debug', function (req: Request<{}, {}, {}>, res: Response, next: NextFunction) {
  res.json({
    title: 'Auth0 Webapp sample Nodejs',
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user || null,
    accessToken: req.oidc.accessToken || null,
    cookies: req.cookies,
    headers: {
      cookie: req.headers.cookie,
      authorization: req.headers.authorization
    }
  });
});

router.get('/', checkJwt, function (req: Request<{}, {}, {}>, res: Response, next: NextFunction) {
  res.json({
    title: 'Auth0 Webapp sample Nodejs',
  });
});

router.get('/profile', requiresAuth(), function (req: Request<{}, {}, {}>, res: Response, next: NextFunction) {
  res.json({
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Profile page'
  });
});

export default router;
