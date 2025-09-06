const axios = require('axios');

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

const languageMap = {
  'c': 50,
  'cpp': 54,
  'java': 62,
  'python': 71,
  'javascript': 63,
  'typescript': 74,
  'node.js': 63,
  'react.js': 63
};

exports.executeCode = async (code, language, stdin = '') => {
  try {
    const languageId = languageMap[language.toLowerCase()];
    
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const response = await axios.post(
      `${JUDGE0_API}/submissions`,
      {
        source_code: code,
        language_id: languageId,
        stdin: stdin,
        redirect_stderr_to_stdout: true
      },
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        params: {
          base64_encoded: 'false',
          fields: '*'
        }
      }
    );

    const submissionId = response.data.token;
    
    // Wait for result
    const result = await this.getSubmissionResult(submissionId);
    return result;
  } catch (error) {
    console.error('Code execution error:', error);
    throw new Error('Failed to execute code');
  }
};

exports.getSubmissionResult = async (submissionId) => {
  try {
    let result;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const response = await axios.get(
        `${JUDGE0_API}/submissions/${submissionId}`,
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          },
          params: {
            base64_encoded: 'false',
            fields: '*'
          }
        }
      );

      result = response.data;
      
      if (result.status && result.status.id > 2) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    return {
      output: result.stdout || result.stderr || result.compile_output || 'No output',
      status: result.status?.description || 'Unknown',
      time: result.time,
      memory: result.memory
    };
  } catch (error) {
    console.error('Get result error:', error);
    throw new Error('Failed to get execution result');
  }
};