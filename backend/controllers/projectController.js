const Project = require('../models/Project');
const { executeCode } = require('../services/codeExecution'); // Add this import
// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    
    const project = new Project({
      name,
      description,
      owner: req.userId,
      isPublic: isPublic || false,
      files: [{
        name: 'main.js',
        content: '// Welcome to your new project!\nconsole.log("Hello, World!");',
        language: 'javascript'
      }]
    });

    await project.save();
    
    // Populate owner details
    await project.populate('owner', 'name email');
    
    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// Get all projects for a user
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { 'collaborators.user': req.userId }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators.user', 'name email')
    .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

// Get single project by ID
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    if (!project.hasAccess(req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner
    if (!project.owner.equals(req.userId)) {
      return res.status(403).json({ message: 'Only owner can update project' });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.isPublic = isPublic !== undefined ? isPublic : project.isPublic;

    await project.save();
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner
    if (!project.owner.equals(req.userId)) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
};


// Execute code
exports.executeCode = async (req, res) => {
  try {
    const { code, language, stdin } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    if (!project.hasAccess(req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await executeCode(code, language, stdin);
    res.json(result);
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update file content
exports.updateFile = async (req, res) => {
  try {
    const { projectId, fileId } = req.params;
    const { content, language } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check edit permission
    if (!project.canEdit(req.userId)) {
      return res.status(403).json({ message: 'Read-only access' });
    }

    const file = project.files.id(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    file.content = content;
    if (language) file.language = language;
    file.lastModified = new Date();
    file.lastModifiedBy = req.userId;

    await project.save();
    
    res.json({ message: 'File updated successfully', file });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ message: 'Server error updating file' });
  }
};

// Manage collaborators
exports.manageCollaborators = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { action, email, role } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can manage collaborators
    if (!project.owner.equals(req.userId)) {
      return res.status(403).json({ message: 'Only owner can manage collaborators' });
    }

    let message;
    switch (action) {
      case 'add':
        if (project.addCollaborator(null, email, role)) {
          message = 'Collaborator invited successfully';
        } else {
          return res.status(400).json({ message: 'Collaborator already invited' });
        }
        break;
      
      case 'remove':
        if (project.removeCollaborator(email)) {
          message = 'Collaborator removed successfully';
        } else {
          return res.status(404).json({ message: 'Collaborator not found' });
        }
        break;
      
      case 'update-role':
        if (project.updateCollaboratorRole(email, role)) {
          message = 'Role updated successfully';
        } else {
          return res.status(404).json({ message: 'Collaborator not found' });
        }
        break;
      
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    await project.save();
    res.json({ message });
  } catch (error) {
    console.error('Manage collaborators error:', error);
    res.status(500).json({ message: 'Server error managing collaborators' });
  }
};