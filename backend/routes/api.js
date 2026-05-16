const express = require('express');
const router = express.Router();

const requireAuth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const aiController = require('../controllers/aiController');
const jobController = require('../controllers/jobController');
const workspaceController = require('../controllers/workspaceController');

router.post('/scan-resume', upload.single('resume'), aiController.scanResume);

router.post('/search-jobs', jobController.searchJobs);

router.get('/workspace', requireAuth, workspaceController.getWorkspace);
router.post('/workspace/save', requireAuth, workspaceController.saveJob);
router.post('/workspace/trash', requireAuth, workspaceController.moveToTrash);
router.post('/workspace/recover', requireAuth, workspaceController.recoverFromTrash);
router.post('/workspace/delete', requireAuth, workspaceController.permanentDelete);

module.exports = router;