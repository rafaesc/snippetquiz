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

interface UserInfo {
  sub: string;
  given_name: string;
  family_name: string;
  nickname: string;
  name: string;
  picture: string;
  updated_at: string;
  email: string;
  email_verified: boolean;
  permissions: string[];
}

router.get('/profile', jwtCheck, async function (req: Request<{}, {}, {}>, res: Response, next: NextFunction) {

  let userInfoEndpoint = (req.auth as any)?.payload?.aud?.find((aud: any) => aud.endsWith("/userinfo"));

  let userInfo = await fetch(userInfoEndpoint, ({
    headers: {
      Authorization: req.headers.authorization,
    },
  }) as any).then((res) => res.json());

  if (!userInfo) {
    res.status(401).send("Unauthorized: missing userinfo");
    return;
  }

  userInfo.permissions = req.auth?.payload?.permissions || [];


  res.status(200).send(userInfo as UserInfo);

});

export default router;
