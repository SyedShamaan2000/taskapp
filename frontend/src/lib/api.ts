import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

// In development, Vite proxies API routes to backend (port 3000)
const apiClient = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let csrfTokenPromise: Promise<string | null> | null = null;
let currentCsrfToken: string | null = null;

/**
 * Fetch and cache the signed CSRF token from the backend
 */
export async function getCsrfToken(): Promise<string | null> {
  if (currentCsrfToken) {
    return currentCsrfToken;
  }

  if (!csrfTokenPromise) {
    csrfTokenPromise = apiClient
      .get<{ csrfToken: string }>('/csrf-token')
      .then((res) => {
        currentCsrfToken = res.data.csrfToken;
        return currentCsrfToken;
      })
      .catch((err) => {
        console.error('Failed to fetch CSRF token:', err);
        return null;
      })
      .finally(() => {
        csrfTokenPromise = null;
      });
  }

  return csrfTokenPromise;
}

// Request Interceptor: Attach CSRF token to state-changing calls & Authorization Bearer
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const method = config.method?.toUpperCase();
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

  if (method && stateChangingMethods.includes(method)) {
    const token = await getCsrfToken();
    if (token) {
      config.headers['CSRF-Token'] = token;
    }
  }

  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Response Interceptor: Handle silent refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    // If 403 because of EBADCSRFTOKEN, clear cached CSRF token and retry once
    const errorData = error.response.data as { message?: string } | undefined;
    if (
      error.response.status === 403 &&
      errorData?.message?.toLowerCase().includes('csrf') &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      currentCsrfToken = null;
      const newToken = await getCsrfToken();
      if (newToken) {
        originalRequest.headers['CSRF-Token'] = newToken;
        return apiClient(originalRequest);
      }
    }

    // If 401 Unauthorized, perform silent token refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      // Don't refresh on login or refresh route itself
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const csrf = await getCsrfToken();
        const refreshResponse = await axios.post<{ success: boolean; accessToken: string }>(
          '/auth/refresh',
          { refreshToken },
          {
            withCredentials: true,
            headers: csrf ? { 'CSRF-Token': csrf } : {},
          }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Extracts a user-friendly error message from an API error
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.response?.status === 404) return 'Resource not found.';
    if (error.response?.status === 429) return 'Too many requests. Please wait a moment.';
    if (error.message) return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

export default apiClient;
