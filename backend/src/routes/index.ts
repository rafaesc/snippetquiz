import { Router, Request, Response, NextFunction } from 'express';

import { auth } from 'express-oauth2-jwt-bearer';
import { User } from '../models/User';
import { Collection } from '../models/Collection';
import { Source } from '../models/Source';
import { getUserMiddleware } from '../middleware/userMiddleware';

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

// Interface for source creation request
interface CreateSourceRequest {
  linkSource?: string;
  text?: string;
  type: 'link' | 'text';
  collectionId: number;
}

// POST route to create a new source
router.post('/sources', jwtCheck, getUserMiddleware, async function (req: Request<{}, {}, CreateSourceRequest>, res: Response, next: NextFunction) {
  try {
    const { linkSource, text, type, collectionId } = req.body;
    const user = req.user!; // getUserMiddleware ensures user exists

    // Validation
    if (!type || !['link', 'text'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "link" or "text"' });
    }

    if (!collectionId) {
      return res.status(400).json({ error: 'Collection ID is required' });
    }

    // Validate type-specific requirements
    if (type === 'link' && !linkSource) {
      return res.status(400).json({ error: 'Link source is required when type is "link"' });
    }

    if (type === 'text' && !text) {
      return res.status(400).json({ error: 'Text is required when type is "text"' });
    }

    // Verify that the collection belongs to the user
    const collection = await Collection.query()
      .where('id', collectionId)
      .where('user_id', user.id)
      .first();

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found or does not belong to user' });
    }

    // Create the source
    const sourceData = {
      user_id: user.id,
      link_source: type === 'link' ? linkSource : undefined,
      text: type === 'text' ? text : undefined,
      type: type,
      collection_id: collectionId
    };

    const newSource = await Source.createSource(sourceData);

    res.status(201).json({
      id: newSource.id,
      user_id: newSource.user_id,
      link_source: newSource.link_source,
      text: newSource.text,
      type: newSource.type,
      collection_id: newSource.collection_id,
      created_date: newSource.created_date
    });
  } catch (error) {
    console.error('Error creating source:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET route to retrieve user's collections
router.get('/collections', jwtCheck, getUserMiddleware, async function (req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!; // getUserMiddleware ensures user exists

    // Fetch user's collections using the DTO method for clean response
    const collections = await Collection.findByUserIdDTO(user.id);

    res.status(200).json({
      collections: collections
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
