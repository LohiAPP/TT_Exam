const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://ttexam-production.up.railway.app').replace(/\/$/, '');

const api = {
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    return response.json();
  },

  async startExam(data) {
    const response = await fetch(`${BASE_URL}/api/exam/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  },

  async getExams() {
    const response = await fetch(`${BASE_URL}/api/exam`);
    return this.handleResponse(response);
  },

  async getQuestions(examId) {
    const response = await fetch(`${BASE_URL}/api/questions/${examId}`);
    return this.handleResponse(response);
  },

  async submitExam(data) {
    const response = await fetch(`${BASE_URL}/api/exam/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  },

  // Admin APIs
  async getDashboardStats() {
    const response = await fetch(`${BASE_URL}/api/exam/stats`);
    return this.handleResponse(response);
  },

  async getResults(examId) {
    const response = await fetch(`${BASE_URL}/api/results/${examId}`);
    return this.handleResponse(response);
  },

  async createExam(data) {
    const response = await fetch(`${BASE_URL}/api/exam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  },

  async updateExam(id, data) {
    const response = await fetch(`${BASE_URL}/api/exam/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  },

  async deleteExam(id) {
    const response = await fetch(`${BASE_URL}/api/exam/${id}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  },

  async updateResult(id, data) {
    const response = await fetch(`${BASE_URL}/api/results/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  },

  async deleteResult(id) {
    const response = await fetch(`${BASE_URL}/api/results/${id}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  },

  async createQuestion(data) {
    const response = await fetch(`${BASE_URL}/api/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  },

  async importQuestions(examId, file) {
    const formData = new FormData();
    formData.append('examId', examId);
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/api/questions/import`, {
      method: 'POST',
      body: formData
    });
    return this.handleResponse(response);
  },

  async updateQuestion(id, data) {
    const response = await fetch(`${BASE_URL}/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(response);
  },

  async deleteQuestion(id) {
    const response = await fetch(`${BASE_URL}/api/questions/${id}`, {
      method: 'DELETE'
    });
    return this.handleResponse(response);
  },

  async bulkDeleteQuestions(ids) {
    const response = await fetch(`${BASE_URL}/api/questions/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    return this.handleResponse(response);
  },

  getExportUrl(examId) {
    return `${BASE_URL}/api/results/${examId}/export`;
  }
};

export default api;
