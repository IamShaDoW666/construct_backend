import express from 'express';
import authController from '../controllers/authController';


const router = express.Router();

router.get('/', authController.auth);
router.post('/login', authController.login);

export default router;