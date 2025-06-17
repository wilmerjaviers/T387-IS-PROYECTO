import axios from 'axios';
const API_URL = '/api/tasks';

const tasksService = {
  // Obtener todas las tareas
  getAllTasks: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);

      const response = await axios.get(`${API_URL}${params.toString() ? '?' + params.toString() : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener tareas');
    }
  },

  // Obtener una tarea específica
  getTask: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener tarea');
    }
  },

  // Crear nueva tarea
  createTask: async (taskData) => {
    try {
      const response = await axios.post(API_URL, taskData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear tarea');
    }
  },

  // Actualizar tarea
  updateTask: async (id, taskData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar tarea');
    }
  },

  // Eliminar tarea
  deleteTask: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar tarea');
    }
  },


getActiveUsers: async () => {
  try {
    const response = await axios.get(`${API_URL}/users/active`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
  }
}
};

export default tasksService;