const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8500/api/';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;

    const headers = requiresAuth
      ? this.getAuthHeaders()
      : { 'Content-Type': 'application/json' };

    // Normalize endpoint to avoid double slashes
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${this.baseURL}${normalizedEndpoint}`;

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || error.message || 'Request failed');
    }

    return response.json();
  }

  async get<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  async post<T>(endpoint: string, data?: unknown, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      requiresAuth,
    });
  }

  async delete<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }
}

export const api = new ApiClient(API_BASE_URL);
