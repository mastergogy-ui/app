export const getToken = (key: 'userToken' | 'adminToken') => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(key) || '';
};

export const setToken = (key: 'userToken' | 'adminToken', value: string) => {
  localStorage.setItem(key, value);
};

export const clearTokens = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('adminToken');
};
