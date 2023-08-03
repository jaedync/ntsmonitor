// ApiKeyInput.js
import React, { useState, useEffect } from 'react';

function ApiKeyInput({ setApiKey }) {
  const [apiKey, setLocalApiKey] = useState(localStorage.getItem('apiKey') || 'my-default-api-key');

  useEffect(() => {
    localStorage.setItem('apiKey', apiKey);
    setApiKey(apiKey);
  }, [apiKey, setApiKey]);

  return (
    <div className="api-key-section">
      <h4>API Key</h4>
      <input type="text" value={apiKey} onChange={(e) => setLocalApiKey(e.target.value)} />
    </div>
  );
}

export default ApiKeyInput;
