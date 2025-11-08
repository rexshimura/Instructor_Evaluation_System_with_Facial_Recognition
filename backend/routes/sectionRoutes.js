import express from 'express';
import * as SecCtrl from '../controllers/sectionController.js';
const router = express.Router();

router.post('/', SecCtrl.createSection);
router.get('/', SecCtrl.listSections);
router.get('/:id', SecCtrl.getSection);
router.put('/:id', SecCtrl.updateSection);
router.delete('/:id', SecCtrl.deleteSection);

export default router;
