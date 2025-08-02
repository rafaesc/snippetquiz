import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from './auth';
import { Collection } from '../models/Collection';
import { Source } from '../models/Source';

const router = Router();

// Interface for source creation request
interface CreateSourceRequest {
  linkSource?: string;
  text?: string;
  type: 'link' | 'text';
  collectionId: number;
}

// POST route to create a new source
router.post('/sources', authenticateJWT, async function (req: Request<{}, {}, CreateSourceRequest>, res: Response, next: NextFunction) {
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
      .where('user_id', (req.user as any).id)
      .first();

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found or does not belong to user' });
    }

    // Create the source
    const sourceData = {
      user_id: (req.user as any).id,
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
router.get('/collections', async function (req: Request, res: Response, next: NextFunction) {
  try {
    // Fetch user's collections using the DTO method for clean response
    const collections = await Collection.findByUserIdDTO((req.user as any).id);

    res.status(200).json({
      collections: collections
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});