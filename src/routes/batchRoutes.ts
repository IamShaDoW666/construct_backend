import express from 'express';
import batchController from '../controllers/batchController';
import upload from '../utils/multer';
const router = express.Router();

router.get('/', batchController.getAllBatch);
router.post('/', batchController.createBatch);
export default router;