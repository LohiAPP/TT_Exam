const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = {
  async startExam(data) {
    const response = await fetch(`${API_BASE_URL}/exam/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getExams() {
    const response = await fetch(`${API_BASE_URL}/exam`);
    return response.json();
  },

  async getQuestions(examId) {
    const response = await fetch(`${API_BASE_URL}/questions/${examId}`);
    return response.json();
  },

  async submitExam(data) {
    const response = await fetch(`${API_BASE_URL}/exam/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Admin APIs
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/exam/stats`);
    return response.json();
  },

  async getResults(examId) {
    const response = await fetch(`${API_BASE_URL}/results/${examId}`);
    return response.json();
  },

  async createExam(data) {
    const response = await fetch(`${API_BASE_URL}/exam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateExam(id, data) {
    const response = await fetch(`${API_BASE_URL}/exam/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteExam(id) {
    const response = await fetch(`${API_BASE_URL}/exam/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  async updateResult(id, data) {
    const response = await fetch(`${API_BASE_URL}/results/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteResult(id) {
    const response = await fetch(`${API_BASE_URL}/results/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  async createQuestion(data) {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async importQuestions(examId, file) {
    const formData = new FormData();
    formData.append('examId', examId);
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/questions/import`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  async updateQuestion(id, data) {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteQuestion(id) {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  getExportUrl(examId) {
    return `${API_BASE_URL}/results/${examId}/export`;
  }
};

export default api;
