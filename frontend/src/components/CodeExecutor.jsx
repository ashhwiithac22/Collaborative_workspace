import { useState } from 'react';

const CodeExecutor = ({ projectId, file, onClose }) => {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stdin, setStdin] = useState('');

  const executeCode = async () => {
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: file.content,
          language: file.language,
          stdin: stdin
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setOutput(result.output || 'No output');
      } else {
        setError(result.message || 'Execution failed');
      }
    } catch (error) {
      setError('Failed to execute code: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal executor-modal">
        <div className="modal-header">
          <h2>🚀 Code Executor - {file.language.toUpperCase()}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-body">
          <div className="executor-controls">
            <div className="form-group">
              <label>Input (stdin):</label>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input here..."
                rows={3}
                disabled={loading}
              />
            </div>

            <button 
              onClick={executeCode} 
              disabled={loading}
              className="btn-primary run-btn"
            >
              {loading ? '🔄 Running...' : '▶️ Run Code'}
            </button>
          </div>

          <div className="executor-output">
            <h3>Output:</h3>
            <div className="output-container">
              {loading ? (
                <div className="loading">Running your code...</div>
              ) : error ? (
                <div className="error-output">{error}</div>
              ) : output ? (
                <pre className="success-output">{output}</pre>
              ) : (
                <div className="no-output">Run the code to see output here</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExecutor;