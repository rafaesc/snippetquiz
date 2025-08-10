import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/', function (req: Request<{}, {}, {}>, res: Response, next: NextFunction) {
  res.json({
    title: 'Auth0 Webapp sample Nodejs',
    isAuthenticated: false,
  });
});

// Add this route for health checks
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;