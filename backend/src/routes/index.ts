import { Router, Request, Response, NextFunction } from 'express';

import { auth } from 'express-oauth2-jwt-bearer';
import { User } from '../models/User';
import { Collection } from '../models/Collection';

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
  try {
    console.log((req.auth as any)?.payload.sub)
    let userInfoEndpoint = (req.auth as any)?.payload?.aud?.find((aud: any) => aud.endsWith("/userinfo"));

    let userInfo = await fetch(userInfoEndpoint, ({
      headers: {
        Authorization: req.headers.authorization,
      },
    }) as any).then((res) => res.json()) as UserInfo;

    if (!userInfo) {
      res.status(401).send("Unauthorized: missing userinfo");
      return;
    }

    userInfo.permissions = (req.auth?.payload?.permissions as string[]) || [];

    // Check if user exists by external_id or email
    let existingUser = await User.query()
      .where('external_id', userInfo.sub)
      .orWhere('email', userInfo.email)
      .first();

    // If user doesn't exist, create a new one
    if (!existingUser) {
      try {
        existingUser = await User.createUser({
          external_id: userInfo.sub,
          name: userInfo.nickname || userInfo.name || 'Unknown User',
          email: userInfo.email
        });

        // Create a default collection for the new user
        await Collection.createCollection({
          user_id: existingUser.id,
          name: 'Default'
        });

      } catch (error) {
        console.error('Error creating user or default collection:', error);
        res.status(500).send('Error creating user profile');
        return;
      }
    }

    // Fetch user's collections using DTO
    const collections = await Collection.findByUserIdDTO(existingUser.id);

    res.status(200).json({
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      collections: collections
    });
  } catch (error) {
    console.error('Error in /profile route:', error);
    res.status(500).send('Internal server error');
  }
});

// Add this route for health checks
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
