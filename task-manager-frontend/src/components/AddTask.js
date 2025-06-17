import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tasksService from '../services/tasksService';
import authService from '../services/authService';
import Swal from 'sweetalert2';

const AddTask = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assigned_to: '',
    due_date: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('🔍 Cargando usuarios...');
      const response = await tasksService.getActiveUsers();
      console.log('✅ Usuarios recibidos:', response);
      setUsers(response.users);
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date || null
      };

      await tasksService.createTask(taskData);

      await Swal.fire({
        title: '¡Éxito!',
        text: 'Tarea creada exitosamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/tasks');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">Empresa de Desarrollo de Software - Añadir Tareas</span>
          <div className="navbar-nav ms-auto">
            <span className="navbar-text text-white">
              👤 {currentUser?.username}
            </span>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h3 className="card-title mb-0">
                  ➕ Añadir Nueva Tarea
                </h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Título */}
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      Título <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Ingresa el título de la tarea"
                      maxLength="255"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Descripción
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Descripción detallada de la tarea (opcional)"
                    />
                  </div>

                  <div className="row">
                    {/* Estado */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="status" className="form-label">
                        Estado
                      </label>
                      <select
                        className="form-select"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="pending">⏳ Pendiente</option>
                        <option value="in_progress">🔄 En Progreso</option>
                        <option value="completed">✅ Completada</option>
                        <option value="cancelled">❌ Cancelada</option>
                      </select>
                    </div>

                    {/* Prioridad */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="priority" className="form-label">
                        Prioridad
                      </label>
                      <select
                        className="form-select"
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="low">🟢 Baja</option>
                        <option value="medium">🟡 Media</option>
                        <option value="high">🔴 Alta</option>
                      </select>
                    </div>
                  </div>

                  {/* Asignar a */}
                  <div className="mb-3">
                    <label htmlFor="assigned_to" className="form-label">
                      Asignar a
                    </label>
                    {loadingUsers ? (
                      <div className="form-control d-flex align-items-center">
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Cargando usuarios...
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        id="assigned_to"
                        name="assigned_to"
                        value={formData.assigned_to}
                        onChange={handleChange}
                      >
                        <option value="">Sin asignar</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.username} ({user.role}) - {user.email}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Fecha de vencimiento */}
                  <div className="mb-4">
                    <label htmlFor="due_date" className="form-label">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="due_date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Botones */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || loadingUsers}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creando...
                        </>
                      ) : (
                        '➕ Crear Tarea'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTask;