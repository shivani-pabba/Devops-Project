import { useState, useCallback } from 'react';

let _showToast = null;

export function Toast() {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);

  _showToast = useCallback((text) => {
    setMsg(text);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  }, []);

  if (!visible) return null;
  return <div className="toast">{msg}</div>;
}

export const showToast = (text) => _showToast && _showToast(text);
