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
  return this.owner.equals(userId) || 
         this.collaborators.some(collab => collab.user.equals(userId));
};

// Method to check user's role in project
projectSchema.methods.getUserRole = function(userId) {
  if (this.owner.equals(userId)) return 'owner';
  const collaborator = this.collaborators.find(collab => collab.user.equals(userId));
  return collaborator ? collaborator.role : null;
};

module.exports = mongoose.model('Project', projectSchema);