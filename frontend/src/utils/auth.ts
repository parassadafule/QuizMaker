export interface AccessToken {
  access: string;
}

export const saveToken = (token: AccessToken) => {
  localStorage.setItem('access_token', token.access);
}

export const getToken = () => {
  return localStorage.getItem('access_token');
}

export const clearToken = () => {
  localStorage.removeItem('access_token');
}

export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error('No access token found');
  }
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {...options,headers});

  if (!response.ok) {
    const errorData=await response.json().catch(() => ({}));
    if (response.status===401) {
      clearToken();
      window.location.href = '/';
      return;
    }
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }

  if (response.status===204 || response.headers.get('content-length')==='0') {
    return null;
  }

  return response.json();
};