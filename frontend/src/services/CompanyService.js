import axios from 'axios';

const API_URL = 'http://localhost:5000/api/companies';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const CompanyService = {
  getAllCompanies: async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
  },

  getCompany: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  },

  addCompany: async (data) => {
    const response = await axios.post(API_URL, data, getAuthHeader());
    return response.data;
  },

  updateCompany: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  },

  verifyCompany: async (id, status) => {
    const response = await axios.put(`${API_URL}/${id}/verify`, { status }, getAuthHeader());
    return response.data;
  }
};

export default CompanyService;
