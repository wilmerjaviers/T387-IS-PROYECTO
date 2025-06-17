import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tasksService from '../services/tasksService';
import authService from '../services/authService';
import Swal from 'sweetalert2';

const ViewTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: ''
  });
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksService.getAllTasks(filters);
      setTasks(response.tasks);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      Swal.fire('Error', 'No se pudieron cargar las tareas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await tasksService.getActiveUsers();
      setUsers(response.users);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assigned_to: ''
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      in_progress: 'bg-info',
      completed: 'bg-success',
      cancelled: 'bg-danger'
    };
    const labels = {
      pending: '⏳ Pendiente',
      in_progress: '🔄 En Progreso',
      completed: '✅ Completada',
      cancelled: '❌ Cancelada'
    };
    return { class: badges[status], label: labels[status] };
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-success',
      medium: 'bg-warning text-dark',
      high: 'bg-danger'
    };
    const labels = {
      low: '🟢 Baja',
      medium: '🟡 Media',
      high: '🔴 Alta'
    };
    return { class: badges[priority], label: labels[priority] };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleString('es-ES');
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-info">
        <div className="container">
          <span className="navbar-brand">Empresa de Desarrollo de Software - Vista de Tareas</span>
          <div className="navbar-nav ms-auto">
            <button 
              className="btn btn-outline-light me-3"
              onClick={() => navigate('/dashboard')}
            >
              🏠 Dashboard
            </button>
            <button 
              className="btn btn-outline-light me-3"
              onClick={() => navigate('/tasks/manage')}
            >
              ⚙️ Gestionar Tareas
            </button>
            <span className="navbar-text text-white">
              👤 {currentUser?.username}
            </span>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>👁️ Visualizar Tareas</h2>
            <p className="text-muted mb-0">Vista de solo lectura para consultar el estado de las tareas</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/tasks/add')}
          >
            ➕ Nueva Tarea
          </button>
        </div>

        {/* Filtros */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">🔍 Filtros</h5>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label htmlFor="status" className="form-label">Estado</label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los estados</option>
                  <option value="pending">⏳ Pendiente</option>
                  <option value="in_progress">🔄 En Progreso</option>
                  <option value="completed">✅ Completada</option>
                  <option value="cancelled">❌ Cancelada</option>
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label htmlFor="priority" className="form-label">Prioridad</label>
                <select
                  className="form-select"
                  id="priority"
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                >
                  <option value="">Todas las prioridades</option>
                  <option value="high">🔴 Alta</option>
                  <option value="medium">🟡 Media</option>
                  <option value="low">🟢 Baja</option>
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="assigned_to" className="form-label">Asignado a</label>
                <select
                  className="form-select"
                  id="assigned_to"
                  name="assigned_to"
                  value={filters.assigned_to}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los usuarios</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2 mb-3 d-flex align-items-end">
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={clearFilters}
                >
                  🗑️ Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de tareas */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2 text-muted">Cargando tareas...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <div className="mb-3">
                <span className="display-1">📝</span>
              </div>
              <h4 className="text-muted">No hay tareas</h4>
              <p className="text-muted">
                {Object.values(filters).some(f => f) 
                  ? 'No se encontraron tareas con los filtros aplicados'
                  : 'Aún no hay tareas creadas'
                }
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/tasks/add')}
              >
                ➕ Crear Primera Tarea
              </button>
            </div>
          </div>
        ) : (
          <div className="row">
            {tasks.map(task => {
              const statusBadge = getStatusBadge(task.status);
              const priorityBadge = getPriorityBadge(task.priority);
              return (
                <div key={task.id} className="col-lg-6 col-xl-4 mb-4">
                  <div className="card h-100 shadow-sm border-info">
                    <div className="card-header bg-light">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="card-title mb-0 text-truncate" title={task.title}>
                          {task.title}
                        </h6>
                        <span className="badge bg-info">Solo Lectura</span>
                      </div>
                    </div>
                    <div className="card-body">
                      {task.description && (
                        <p className="card-text text-muted small mb-3">
                          {task.description.length > 100 
                            ? task.description.substring(0, 100) + '...'
                            : task.description
                          }
                        </p>
                      )}

                      <div className="mb-3">
                        <span className={`badge ${statusBadge.class} me-2`}>
                          {statusBadge.label}
                        </span>
                        <span className={`badge ${priorityBadge.class}`}>
                          {priorityBadge.label}
                        </span>
                      </div>

                      <div className="small text-muted">
                        <div className="mb-2">
                          <strong>📝 Creado por:</strong> {task.created_by_username}
                        </div>
                        {task.assigned_to_username && (
                          <div className="mb-2">
                            <strong>👤 Asignado a:</strong> {task.assigned_to_username}
                          </div>
                        )}
                        <div className="mb-2">
                          <strong>📅 Vencimiento:</strong> {formatDate(task.due_date)}
                        </div>
                        <div className="mb-2">
                          <strong>🕒 Creado:</strong> {formatDateTime(task.created_at)}
                        </div>
                        {task.updated_at !== task.created_at && (
                          <div className="mb-2">
                            <strong>✏️ Actualizado:</strong> {formatDateTime(task.updated_at)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card-footer bg-light text-center">
                      <small className="text-muted">
                        💡 Para editar esta tarea, usa "Gestionar Tareas"
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Resumen */}
        {!loading && tasks.length > 0 && (
          <div className="mt-4">
            <div className="card bg-light border-info">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">📊 Resumen de Tareas</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <h5 className="text-info">{tasks.length}</h5>
                    <small className="text-muted">Total de tareas</small>
                  </div>
                  <div className="col-md-3">
                    <h5 className="text-warning">{tasks.filter(t => t.status === 'pending').length}</h5>
                    <small className="text-muted">Pendientes</small>
                  </div>
                  <div className="col-md-3">
                    <h5 className="text-info">{tasks.filter(t => t.status === 'in_progress').length}</h5>
                    <small className="text-muted">En progreso</small>
                  </div>
                  <div className="col-md-3">
                    <h5 className="text-success">{tasks.filter(t => t.status === 'completed').length}</h5>
                    <small className="text-muted">Completadas</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nota informativa */}
        <div className="mt-4">
          <div className="alert alert-info">
            <h6 className="alert-heading">ℹ️ Información</h6>
            <p className="mb-0">
              Esta es la vista de <strong>solo lectura</strong> para consultar las tareas. 
              Para editar, eliminar o gestionar tareas, utiliza la sección 
              <strong> "Gestionar Tareas"</strong> desde el menú principal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTasks;