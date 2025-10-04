const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const authService = {
  async register(userData: { username: string; email: string; address: string; password: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async login(credentials: { username: string; password: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async logout() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async verifyToken(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  },

  async updateProfile(profileData: { username?: string; email?: string; address?: string }) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      return await response.json();
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async refreshToken() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async checkUserExists(address: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/check/${address}`, {
        method: 'GET',
      });

      return await response.json();
    } catch (error) {
      console.error('Check user exists error:', error);
      return { exists: false };
    }
  },
};
