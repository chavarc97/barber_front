// client/barber-front/src/components/GoogleSignInButton.tsx
import { useEffect } from 'react';
import { api } from '../../lib/api';

declare global {
  interface Window { google: any; }
}

type Role = 'client' | 'barber';

interface Props {
  /** role to register as when creating a new user; defaults to env `VITE_DEFAULT_ROLE` or `client` */
  role?: Role;
  /** optional callback invoked with backend response on success */
  onSuccess?: (data: any) => void;
}

export default function GoogleSignInButton({ role: propRole, onSuccess }: Props) {
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google?.accounts?.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        ux_mode: 'popup',
      });

      const container = document.getElementById('g_id_signin');
      if (container) {
        window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large' });
      }
    };

    return () => {
      try { document.body.removeChild(script); } catch (e) { /* ignore */ }
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    const idToken = response?.credential;
    if (!idToken) return;

    // backend endpoint and role configuration
    const endpoint = import.meta.env.VITE_GOOGLE_ENDPOINT || 'google/'; // appended to API base URL from `api`
    const defaultRole = (import.meta.env.VITE_DEFAULT_ROLE as Role) || 'client';
    const role: Role = propRole || defaultRole;

    try {
      // use api helper (no auth required for login)
      const data = await api.post<any>(endpoint, { id_token: idToken, role }, false);

      // store tokens
      if (data.access) localStorage.setItem('access_token', data.access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

      if (onSuccess) onSuccess(data);
      else window.location.reload();
    } catch (err: any) {
      console.error('Google login error', err.message || err);
      alert('Google login failed');
    }
  };

  return <div id="g_id_signin" />;
}