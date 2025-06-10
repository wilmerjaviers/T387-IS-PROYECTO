import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tasksService from '../services/tasksService';
import authService from '../services/authService';
import Swal from 'sweetalert2';

const EditTask = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    assigned_to: '',
    due_date: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [task, setTask] = useState(null);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadTask();
    loadUsers();
  }, [id]);

  const loadTask = async () => {
    try {
      const response = await tasksService.getTask(id);
      const taskData = response.task;
      setTask(taskData);
      
      // Formatear fecha para el input date
      const dueDate = taskData.due_date ? 
        new Date(taskData.due_date).toISOString().split('T')[0] : '';
      
      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || '',
        priority: taskData.priority || '',
        assigned_to: taskData.assigned_to || '',
        due_date: dueDate
      });
    } catch (error) {
      console.error('Error al cargar tarea:', error);
      Swal.fire('Error', error.message, 'error').then(() => {
        navigate('/tasks');
      });
    } finally {
      setLoadingTask(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await tasksService.getActiveUsers();
      setUsers(response.users);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
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
      const updateData = {
        ...formData,
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date || null
      };

      await tasksService.updateTask(id, updateData);

      await Swal.fire({
        title: '¡Éxito!',
        text: 'Tarea actualizada exitosamente',
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
    navigate('/tasks');
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '¿Eliminar tarea?',
      text: `¿Estás seguro de que quieres eliminar la tarea "${task?.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await tasksService.deleteTask(id);
        await Swal.fire('¡Eliminada!', 'La tarea ha sido eliminada.', 'success');
        navigate('/tasks');
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  const canDelete = currentUser?.role === 'admin' || parseInt(task?.created_by) === parseInt(currentUser?.id);

  if (loadingTask) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando tarea...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">📋 Task Manager</span>
          <div className="navbar-nav ms-auto">
            <button 
              className="btn btn-outline-light me-3"
              onClick={() => navigate('/tasks')}
            >
              📋 Ver Tareas
            </button>
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
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h3 className="card-title mb-0">
                  ✏️ Editar Tarea
                </h3>
                {canDelete && (
                  <button 
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={handleDelete}
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>
              <div className="card-body">
                {/* Información de la tarea */}
                <div className="mb-4 p-3 bg-light rounded">
                  <small className="text-muted">
                    <strong>Creado por:</strong> {task?.created_by_username}<br />
                    <strong>Fecha de creación:</strong> {task?.created_at ? new Date(task.created_at).toLocaleString('es-ES') : ''}<br />
                    <strong>Última actualización:</strong> {task?.updated_at ? new Date(task.updated_at).toLocaleString('es-ES') : ''}
                  </small>
                </div>

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
                      rows="4"
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
                          Actualizando...
                        </>
                      ) : (
                        '💾 Actualizar Tarea'
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

export default EditTask;