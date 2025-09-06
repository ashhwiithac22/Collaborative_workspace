import { useState } from 'react';

const InviteModal = ({ isOpen, onClose, project, onInvite }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'editor'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onInvite(project._id, formData.email, formData.role);
      setFormData({ email: '', role: 'editor' });
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Invite Collaborator 👥</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <div className="modal-body">
          <p>Invite someone to collaborate on <strong>"{project.name}"</strong></p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="invite-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter collaborator's email"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                disabled={loading}
              >
                <option value="editor">Editor (can edit code)</option>
                <option value="viewer">Viewer (read-only access)</option>
              </select>
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={onClose}
                disabled={loading}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <div className="button-spinner"></div>
                    Sending...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;