import express from 'express';
import mediaController from '../controllers/mediaController';
import upload from '../utils/multer';
const router = express.Router();

router.get('/', mediaController.getAllMedia);
router.post('/', upload.single('image'), mediaController.createMedia)

export default router;