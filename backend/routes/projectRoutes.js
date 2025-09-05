const express = require('express');
const { 
  createProject, 
  getUserProjects, 
  getProject, 
  updateProject, 
  deleteProject 
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

module.exports = router;