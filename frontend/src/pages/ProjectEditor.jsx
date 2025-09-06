import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import CollaboratorManager from '../components/CollaboratorManager';
import CodeExecutor from '../components/CodeExecutor';

const ProjectEditor = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showCollaboratorManager, setShowCollaboratorManager] = useState(false);
  const [showCodeExecutor, setShowCodeExecutor] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setCurrentFile(data.project.files[0]);
        
        // Set user role
        const role = data.project.owner._id === user.id ? 'owner' : 
                    data.project.collaborators.find(c => c.user._id === user.id)?.role || 'viewer';
        setUserRole(role);
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
    // Auto-save could be implemented here
  };

  const handleLanguageChange = async (newLanguage) => {
    try {
      const token = localStorage.getItem('token');
      const templateCode = getTemplateCode(newLanguage);
      
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/files/${currentFile._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: templateCode,
          language: newLanguage 
        })
      });

      if (response.ok) {
        setProject(prev => ({
          ...prev,
          files: prev.files.map(file => 
            file._id === currentFile._id 
              ? { 
                  ...file, 
                  content: templateCode, 
                  language: newLanguage,
                  lastModified: new Date().toISOString() 
                }
              : file
          )
        }));
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const getTemplateCode = (language) => {
    const templates = {
      'c': `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
      'cpp': `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
      'java': `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
      'python': `print("Hello, World!")`,
      'javascript': `console.log("Hello, World!");`,
      'typescript': `const message: string = "Hello, World!";\nconsole.log(message);`,
      'node.js': `console.log("Hello from Node.js!");`,
      'react.js': `import React from 'react';\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello, World!</h1>\n    </div>\n  );\n}\n\nexport default App;`
    };
    return templates[language] || templates.javascript;
  };

  const canEdit = userRole === 'owner' || userRole === 'editor';

  if (loading) return <div className="loading">Loading project...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="project-editor">
      <header className="editor-header">
        <div className="editor-nav">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            ← Dashboard
          </button>
          <h1>{project.name}</h1>
          <div className="editor-actions">
            <span className={`role-badge ${userRole}`}>
              {userRole.toUpperCase()}
            </span>
            {userRole === 'owner' && (
              <button 
                onClick={() => setShowCollaboratorManager(true)}
                className="btn-primary"
              >
                👥 Manage Collaborators
              </button>
            )}
            <button 
              onClick={() => setShowCodeExecutor(true)}
              className="btn-primary"
            >
              🚀 Run Code
            </button>
          </div>
        </div>

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

      <div className="editor-content">
        {currentFile && (
          <div className="editor-main">
            <div className="editor-toolbar">
              <div className="language-selector">
                <label>Language: </label>
                <select 
                  value={currentFile.language} 
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  disabled={!canEdit}
                >
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="node.js">Node.js</option>
                  <option value="react.js">React.js</option>
                </select>
              </div>
              
              {canEdit && (
                <button onClick={() => handleSaveFile(currentFile.content)} className="btn-primary">
                  💾 Save
                </button>
              )}
            </div>

            <CodeEditor
              file={currentFile}
              onSave={handleSaveFile}
              onContentChange={handleContentChange}
              readOnly={!canEdit}
            />
          </div>
        )}

        <div className="editor-sidebar">
          <div className="sidebar-section">
            <h3>📁 Project Files</h3>
            <ul>
              {project.files.map(file => (
                <li
                  key={file._id}
                  className={currentFile && currentFile._id === file._id ? 'active' : ''}
                  onClick={() => setCurrentFile(file)}
                >
                  <span className="file-icon">📄</span>
                  {file.name}
                  <span className="file-language">{file.language}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>👥 Collaborators ({project.collaborators.length + 1})</h3>
            <div className="collaborator-list">
              <div className="collaborator-item owner">
                <span className="user-avatar">👑</span>
                <div className="user-info">
                  <strong>{project.owner.name}</strong>
                  <span>Owner</span>
                </div>
              </div>
              
              {project.collaborators.map(collab => (
                <div key={collab._id} className="collaborator-item">
                  <span className="user-avatar">👤</span>
                  <div className="user-info">
                    <strong>{collab.user.name}</strong>
                    <span className={`role ${collab.role}`}>{collab.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCollaboratorManager && (
        <CollaboratorManager
          project={project}
          onClose={() => setShowCollaboratorManager(false)}
          onUpdate={fetchProject}
        />
      )}

      {showCodeExecutor && currentFile && (
        <CodeExecutor
          projectId={projectId}
          file={currentFile}
          onClose={() => setShowCodeExecutor(false)}
        />
      )}
    </div>
  );
};

export default ProjectEditor;