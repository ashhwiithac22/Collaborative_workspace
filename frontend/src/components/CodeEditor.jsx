import { useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ file, onSave, onContentChange, readOnly = false }) => {
  const [content, setContent] = useState(file.content || '');

  const handleEditorChange = (value) => {
    setContent(value);
    onContentChange(value);
  };

  const handleSave = () => {
    onSave(content);
  };

  const languageMap = {
    'c': 'c',
    'cpp': 'cpp',
    'java': 'java',
    'python': 'python',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'node.js': 'javascript',
    'react.js': 'javascript'
  };

  return (
    <div className="code-editor-container">
      <div className="editor-header">
        <h3>{file.name}</h3>
        {!readOnly && (
          <button onClick={handleSave} className="btn-primary save-btn">
            💾 Save
          </button>
        )}
      </div>
      
      <div className={`editor-wrapper ${readOnly ? 'read-only' : ''}`}>
        <Editor
          height="70vh"
          language={languageMap[file.language] || 'javascript'}
          value={content}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly: readOnly,
            wordWrap: 'on',
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto'
            }
          }}
        />
        
        {readOnly && (
          <div className="read-only-overlay">
            <div className="read-only-message">
              <span>👀 Read Only - Viewer Mode</span>
              <p>You have view-only access to this project</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;