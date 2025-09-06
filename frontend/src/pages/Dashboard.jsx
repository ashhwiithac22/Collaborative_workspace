import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import InviteModal from '../components/InviteModal';

const Dashboard = ({ onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      } else {
        throw new Error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
      if (error.response?.status === 401) {
        // Token is invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (projectData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        const newProject = await response.json();
        setProjects([newProject.project, ...projects]);
        setShowCreateModal(false);
        setSuccess('Project created successfully! 🎉');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProjects(projects.filter(p => p._id !== projectId));
        setSuccess('Project deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    }
  };

  const handleInviteCollaborator = async (projectId, email, role) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/invites/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, recipientEmail: email, role })
      });

      if (response.ok) {
        setSuccess('Invitation sent successfully! 📧');
        setShowInviteModal(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError(error.message || 'Failed to send invitation');
    }
  };

  const handleOpenInviteModal = (project) => {
    setSelectedProject(project);
    setShowInviteModal(true);
  };

  const handleProjectSelect = (project) => {
    navigate(`/project/${project._id}`);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call the parent logout handler if provided
    if (onLogout) {
      onLogout();
    }
    
    // Redirect to login page
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your projects...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>My Projects 🚀</h1>
          <p>Manage your coding projects and collaborate with others</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="btn-primary create-btn"
          >
            <span>+</span> New Project
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="dashboard-content">
        <div className="projects-section">
          <div className="section-header">
            <h2>Your Projects ({projects.length})</h2>
            <p>Click on any project to start coding</p>
          </div>
          
          <div className="projects-grid">
            {projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h3>No projects yet</h3>
                <p>Create your first project to start your coding journey!</p>
                <button 
                  onClick={() => setShowCreateModal(true)} 
                  className="btn-primary"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              projects.map(project => (
                <ProjectCard 
                  key={project._id} 
                  project={project} 
                  onSelect={handleProjectSelect}
                  onDelete={handleDeleteProject}
                  onInvite={handleOpenInviteModal}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
      />

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        project={selectedProject}
        onInvite={handleInviteCollaborator}
      />
    </div>
  );
};

export default Dashboard;