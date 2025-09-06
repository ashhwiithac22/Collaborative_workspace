const ProjectCard = ({ project, onSelect, onDelete, onInvite }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isOwner = user && project.owner._id === user.id;

  const handleInviteClick = (e) => {
    e.stopPropagation();
    onInvite(project);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(project._id);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onSelect(project);
  };

  return (
    <div className="project-card" onClick={() => onSelect(project)}>
      <div className="project-header">
        <h3>{project.name}</h3>
        {isOwner && (
          <div className="project-actions">
            <button 
              className="btn-invite"
              onClick={handleInviteClick}
              title="Invite Collaborator"
            >
              👥
            </button>
            <button 
              className="btn-delete"
              onClick={handleDeleteClick}
              title="Delete Project"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
      
      <p className="project-description">{project.description || 'No description provided'}</p>
      
      <div className="project-meta">
        <div className="meta-item">
          <span>📁 {project.files?.length || 0} files</span>
        </div>
        <div className="meta-item">
          <span>👥 {(project.collaborators?.length || 0) + 1} people</span>
        </div>
        <div className="meta-item">
          <span>📅 {new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="meta-item">
          <span>{project.isPublic ? '🌐 Public' : '🔒 Private'}</span>
        </div>
      </div>

      <div className="project-footer">
        <span className={isOwner ? "owner-badge" : "collaborator-badge"}>
          {isOwner ? '👑 Owner' : '🤝 Collaborator'}
        </span>
        <button 
          className="btn-open"
          onClick={handleEditClick}
        >
          Open Project →
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;