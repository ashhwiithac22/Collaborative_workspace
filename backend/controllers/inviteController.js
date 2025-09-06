const Invite = require('../models/Invite');
const Project = require('../models/Project');
const User = require('../models/User');
const { sendInvitationEmail } = require('../utils/email');
const crypto = require('crypto');

exports.sendInvite = async (req, res) => {
  try {
    const { projectId, recipientEmail, role } = req.body;
    const userId = req.userId;

    // Check if project exists and user is owner
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.isOwner(userId)) {
      return res.status(403).json({ message: 'Only project owner can send invitations' });
    }

    // Check if user is inviting themselves
    const user = await User.findById(userId);
    if (user.email === recipientEmail) {
      return res.status(400).json({ message: 'Cannot invite yourself' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: recipientEmail });
    if (existingUser) {
      // Check if already a collaborator
      if (project.hasAccess(existingUser._id)) {
        return res.status(400).json({ message: 'User is already a collaborator' });
      }
    }

    // Check for existing pending invite
    const existingInvite = await Invite.findOne({
      project: projectId,
      recipientEmail,
      status: 'pending'
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'Invitation already sent to this email' });
    }

    // Create invitation token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invite = new Invite({
      project: projectId,
      sender: userId,
      recipientEmail,
      role,
      token
    });

    await invite.save();

    // Send email
    await sendInvitationEmail(recipientEmail, user.name, project.name, token);

    res.json({ 
      message: 'Invitation sent successfully',
      invite 
    });

  } catch (error) {
    console.error('Send invite error:', error);
    res.status(500).json({ message: 'Server error sending invitation' });
  }
};

exports.getProjectInvites = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.hasAccess(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const invites = await Invite.find({ project: projectId })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

    res.json({ invites });
  } catch (error) {
    console.error('Get invites error:', error);
    res.status(500).json({ message: 'Server error fetching invites' });
  }
};