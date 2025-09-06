import { useState } from 'react';

const CollaboratorManager = ({ project, onClose, onUpdate }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${project._id}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'add',
          email: email,
          role: role
        })
      });

      if (response.ok) {
        setSuccess('Invitation sent successfully!');
        setEmail('');
        onUpdate(); // Refresh project data
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (collaboratorEmail) => {
    if (!window.confirm('Are you sure you want to remove this collaborator?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${project._id}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'remove',
          email: collaboratorEmail
        })
      });

      if (response.ok) {
        setSuccess('Collaborator removed successfully!');
        onUpdate(); // Refresh project data
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRoleChange = async (collaboratorEmail, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${project._id}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'update-role',
          email: collaboratorEmail,
          role: newRole
        })
      });

      if (response.ok) {
        setSuccess('Role updated successfully!');
        onUpdate(); // Refresh project data
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal collaborator-modal">
        <div className="modal-header">
          <h2>👥 Manage Collaborators</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="collaborator-form">
            <h3>Invite New Collaborator</h3>
            <form onSubmit={handleInvite}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter collaborator's email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="editor">Editor (can edit code)</option>
                  <option value="viewer">Viewer (read-only access)</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </form>
          </div>

          <div className="current-collaborators">
            <h3>Current Collaborators</h3>
            <div className="collaborators-list">
              <div className="collaborator-item owner">
                <span className="user-avatar">👑</span>
                <div className="user-info">
                  <strong>{project.owner.name}</strong>
                  <span className="role owner">Owner</span>
                </div>
              </div>

              {project.collaborators.map(collab => (
                <div key={collab._id} className="collaborator-item">
                  <span className="user-avatar">👤</span>
                  <div className="user-info">
                    <strong>{collab.user?.name || collab.invitedEmail}</strong>
                    <span className={`role ${collab.role}`}>{collab.role}</span>
                    {collab.status === 'pending' && (
                      <span className="status pending">Pending</span>
                    )}
                  </div>
                  
                  <div className="collaborator-actions">
                    <select
                      value={collab.role}
                      onChange={(e) => handleRoleChange(collab.user?.email || collab.invitedEmail, e.target.value)}
                      className="role-select"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    
                    <button
                      onClick={() => handleRemove(collab.user?.email || collab.invitedEmail)}
                      className="btn-danger"
                      title="Remove collaborator"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorManager;