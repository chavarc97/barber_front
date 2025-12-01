import { useEffect } from 'react';
import { api } from '../../lib/api';

declare global {
  interface Window {
    google: any;
  }
}

type Role = 'client' | 'barber';

interface Props {
  /** Role to register as when creating a new user */
  role?: Role;
  /** Optional callback invoked with backend response on success */
  onSuccess?: (data: any) => void;
  /** Optional callback for errors */
  onError?: (error: string) => void;
}

export default function GoogleSignInButton({ 
  role: propRole, 
  onSuccess,
  onError 
}: Props) {
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set');
      return;
    }

    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          ux_mode: 'popup',
          auto_select: false,
        });

        // Render the button
        const container = document.getElementById('g_id_signin');
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
          });
        }
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Sign-In script');
      if (onError) {
        onError('Failed to load Google Sign-In');
      }
    };

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // Script already removed
      }
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    const idToken = response?.credential;
    
    if (!idToken) {
      console.error('No credential in response');
      if (onError) {
        onError('No credential received from Google');
      }
      return;
    }

    // Backend endpoint and role configuration
    const endpoint = import.meta.env.VITE_GOOGLE_ENDPOINT || 'google/';
    const defaultRole = (import.meta.env.VITE_DEFAULT_ROLE as Role) || 'client';
    const role: Role = propRole || defaultRole;

    try {
      // Call backend API (no auth required for login)
      const data = await api.post<any>(
        endpoint,
        { id_token: idToken, role },
        false // requiresAuth = false
      );

      // Store tokens in localStorage
      if (data.access) {
        localStorage.setItem('access_token', data.access);
      }
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }

      // Call success callback or reload page
      if (onSuccess) {
        onSuccess(data);
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      console.error('Google login error:', err.message || err);
      const errorMessage = err.message || 'Google login failed';
      
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    }
  };

  return (
    <div className="w-full">
      <div id="g_id_signin" className="w-full"></div>
    </div>
  );
}