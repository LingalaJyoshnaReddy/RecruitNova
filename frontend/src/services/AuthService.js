import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AuthService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (formData) => {
    const response = await axios.post(`${API_URL}/register`, {
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default AuthService;
