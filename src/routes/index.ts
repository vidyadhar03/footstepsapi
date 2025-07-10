import { Router } from 'express';
import profileRoutes from './profile';

const router = Router();

// Mount all route modules
router.use('/profile', profileRoutes);

export default router; 