const express = require('express');
const { sendInvite, getProjectInvites } = require('../controllers/inviteController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/send', sendInvite);
router.get('/project/:projectId', getProjectInvites);

module.exports = router;