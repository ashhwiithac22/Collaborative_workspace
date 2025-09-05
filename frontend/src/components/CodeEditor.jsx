import { useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ file, onSave, onContentChange }) => {
  const [content, setContent] = useState(file.content || '');

  const handleEditorChange = (value) => {
    setContent(value);
    onContentChange(value);
  };

  const handleSave = () => {
    onSave(content);
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <h3>{file.name}</h3>
        <button onClick={handleSave} className="btn-primary">
          Save
        </button>
      </div>
      <Editor
        height="500px"
        language={file.language || 'javascript'}
        value={content}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;