const express = require('express');
const { 
  createProject, 
  getUserProjects, 
  getProject, 
  updateProject, 
  deleteProject,
  executeCode,
  updateFile,
  manageCollaborators
} = require('../controllers/projectController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create a new project
router.post('/', createProject);

// Get all projects for user
router.get('/', getUserProjects);

// Get single project
router.get('/:id', getProject);

// Update project
router.put('/:id', updateProject);

// Delete project
router.delete('/:id', deleteProject);

// New routes for enhanced functionality
router.post('/:projectId/execute', executeCode);
router.put('/:projectId/files/:fileId', updateFile);
router.post('/:projectId/collaborators', manageCollaborators);

module.exports = router;