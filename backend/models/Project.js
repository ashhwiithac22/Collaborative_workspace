const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'editor'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  files: [{
    name: {
      type: String,
      required: true
    },
    content: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript'
    },
    lastModified: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add index for better performance
projectSchema.index({ owner: 1, createdAt: -1 });

// Method to check if user has access to project
projectSchema.methods.hasAccess = function(userId) {
  if (!userId) return false;
  return this.owner.equals(userId) || 
         this.collaborators.some(collab => collab.user && collab.user.equals(userId));
};

// Method to check user's role in project
projectSchema.methods.getUserRole = function(userId) {
  if (!userId) return null;
  if (this.owner.equals(userId)) return 'owner';
  const collaborator = this.collaborators.find(collab => 
    collab.user && collab.user.equals(userId)
  );
  return collaborator ? collaborator.role : null;
};

// Method to check if user is owner
projectSchema.methods.isOwner = function(userId) {
  if (!userId) return false;
  return this.owner.equals(userId);
};

// Method to add collaborator
projectSchema.methods.addCollaborator = function(userId, role = 'editor') {
  if (!userId) return false;
  
  // Check if already a collaborator
  const existingCollaborator = this.collaborators.find(collab => 
    collab.user && collab.user.equals(userId)
  );
  
  if (existingCollaborator) {
    // Update role if different
    if (existingCollaborator.role !== role) {
      existingCollaborator.role = role;
      return true;
    }
    return false;
  }
  
  // Add new collaborator
  this.collaborators.push({ 
    user: userId, 
    role,
    joinedAt: new Date()
  });
  return true;
};

// Method to remove collaborator
projectSchema.methods.removeCollaborator = function(userId) {
  if (!userId) return false;
  
  const initialLength = this.collaborators.length;
  this.collaborators = this.collaborators.filter(collab => 
    !collab.user || !collab.user.equals(userId)
  );
  
  return this.collaborators.length < initialLength;
};

// Method to get all collaborators with user details
projectSchema.methods.getCollaboratorsDetails = async function() {
  await this.populate('collaborators.user', 'name email');
  return this.collaborators;
};

// Method to check if email is already invited or collaborating
projectSchema.methods.isEmailAssociated = async function(email) {
  // Check if email is owner's email
  await this.populate('owner', 'email');
  if (this.owner.email === email) {
    return { type: 'owner', user: this.owner };
  }
  
  // Check if email is already a collaborator
  await this.populate('collaborators.user', 'email');
  const existingCollaborator = this.collaborators.find(collab => 
    collab.user && collab.user.email === email
  );
  
  if (existingCollaborator) {
    return { type: 'collaborator', user: existingCollaborator.user, role: existingCollaborator.role };
  }
  
  return null;
};

// Static method to find projects by user
projectSchema.statics.findByUserId = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { 'collaborators.user': userId }
    ]
  }).populate('owner', 'name email')
    .populate('collaborators.user', 'name email');
};

// Virtual for total collaborators count
projectSchema.virtual('totalCollaborators').get(function() {
  return this.collaborators.length + 1; // +1 for owner
});

// Ensure virtual fields are serialized
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);