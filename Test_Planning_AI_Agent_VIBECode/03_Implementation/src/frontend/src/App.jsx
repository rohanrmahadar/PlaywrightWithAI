import React, { useEffect, useState } from 'react';
import MainPage from './MainPage.jsx';
import SettingsPage from './SettingsPage.jsx';
import { api } from './api.js';

// User-entered config lives only in React state (memory). It is never written to
// localStorage/sessionStorage and is cleared on page reload.
const EMPTY = { jiraUrl: '', jiraEmail: '', jiraToken: '', groqKey: '', groqModel: '', ollamaUrl: '', ollamaModel: '', provider: '' };

export default function App() {
  const [page, setPage] = useState('main');
  const [config, setConfig] = useState(EMPTY);
  const [server, setServer] = useState(null);

  useEffect(() => {
    api('/settings')
      .then((s) => {
        setServer(s);
        setConfig((c) => ({ ...c, jiraUrl: c.jiraUrl || s.jiraUrl, jiraEmail: c.jiraEmail || s.jiraEmail, ollamaUrl: c.ollamaUrl || s.ollamaUrl, provider: c.provider || s.provider }));
      })
      .catch(() => setServer({ error: true }));
  }, []);

  return (
    <div className="app">
      <nav className="nav">
        <strong>Test Plan Generator</strong>
        <div>
          <button className={page === 'main' ? 'tab active' : 'tab'} onClick={() => setPage('main')}>Main page</button>
          <button className={page === 'settings' ? 'tab active' : 'tab'} onClick={() => setPage('settings')}>Settings</button>
        </div>
      </nav>
      {/* Both pages stay mounted so input and results survive tab switches */}
      <div hidden={page !== 'main'}><MainPage config={config} goToSettings={() => setPage('settings')} /></div>
      <div hidden={page !== 'settings'}><SettingsPage config={config} setConfig={setConfig} server={server} /></div>
    </div>
  );
}
