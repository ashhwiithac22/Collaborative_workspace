import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';

const ProjectEditor = () => {  // Removed unused onLogout prop
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProject = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setCurrentFile(data.project.files[0]); // Select first file by default
      } else {
        throw new Error('Failed to fetch project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSaveFile = async (content) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/files/${currentFile._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        alert('File saved successfully!');
        // Update local state
        setProject(prev => ({
          ...prev,
          files: prev.files.map(file => 
            file._id === currentFile._id 
              ? { ...file, content, lastModified: new Date().toISOString() }
              : file
          )
        }));
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file');
    }
  };

  const handleContentChange = (content) => {
    // You can add auto-save logic or real-time collaboration here later
    console.log('Content changed:', content.length, 'characters');
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="project-editor">
      <header className="editor-header">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          ← Back to Dashboard
        </button>
        <h1>{project.name}</h1>
        <div className="file-tabs">
          {project.files.map(file => (
            <button
              key={file._id}
              onClick={() => setCurrentFile(file)}
              className={currentFile && currentFile._id === file._id ? 'active' : ''}
            >
              {file.name}
            </button>
          ))}
        </div>
      </header>

      {currentFile && (
        <CodeEditor
          file={currentFile}
          onSave={handleSaveFile}
          onContentChange={handleContentChange}
        />
      )}

      <div className="editor-sidebar">
        <h3>Project Files</h3>
        <ul>
          {project.files.map(file => (
            <li
              key={file._id}
              className={currentFile && currentFile._id === file._id ? 'active' : ''}
              onClick={() => setCurrentFile(file)}
            >
              {file.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProjectEditor;