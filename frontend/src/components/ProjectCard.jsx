const ProjectCard = ({ project, onSelect }) => {
  return (
    <div className="project-card" onClick={() => onSelect(project)}>
      <h3>{project.name}</h3>
      <p>{project.description || 'No description'}</p>
      <div className="project-meta">
        <span>Files: {project.files.length}</span>
        <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default ProjectCard;