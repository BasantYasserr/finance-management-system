import express from 'express';
import {attachFiles} from '../modules/attachment.js'
import { upload } from '../middleware/fileUpload.js';

const router = express.Router();

router.post('/attachments', upload.single('file'), attachFiles);

export default router;