import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tasksService from '../services/tasksService';
import authService from '../services/authService';
import Swal from 'sweetalert2';

const ManageTasks = () => {
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

  const handleEditTask = (taskId) => {
    navigate(`/tasks/edit/${taskId}`);
  };

  const handleQuickStatusChange = async (taskId, newStatus, taskTitle) => {
    try {
      await tasksService.updateTask(taskId, { status: newStatus });
      await Swal.fire({
        title: '¡Actualizado!',
        text: `Estado de "${taskTitle}" cambiado exitosamente`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      loadTasks();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    const result = await Swal.fire({
      title: '¿Eliminar tarea?',
      text: `¿Estás seguro de que quieres eliminar la tarea "${taskTitle}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await tasksService.deleteTask(taskId);
        await Swal.fire('¡Eliminada!', 'La tarea ha sido eliminada.', 'success');
        loadTasks();
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  const canEditTask = (task) => {
    return currentUser?.role === 'admin' || 
           parseInt(task.created_by) === parseInt(currentUser?.id) || 
           parseInt(task.assigned_to) === parseInt(currentUser?.id);
  };

  const canEditFullTask = (task) => {
    return currentUser?.role === 'admin' || parseInt(task.created_by) === parseInt(currentUser?.id);
  };

  const canChangeStatus = (task) => {
    return currentUser?.role === 'admin' || 
           parseInt(task.created_by) === parseInt(currentUser?.id) || 
           parseInt(task.assigned_to) === parseInt(currentUser?.id);
  };

  const canDeleteTask = (task) => {
    return currentUser?.role === 'admin' || parseInt(task.created_by) === parseInt(currentUser?.id);
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-secondary">
        <div className="container">
          <span className="navbar-brand">Empresa de Desarrollo de Software - Gestión de Tareas</span>
          <div className="navbar-nav ms-auto">
            <button 
              className="btn btn-outline-light me-3"
              onClick={() => navigate('/dashboard')}
            >
              🏠 Dashboard
            </button>
            <button 
              className="btn btn-outline-light me-3"
              onClick={() => navigate('/tasks')}
            >
              👁️ Solo Ver Tareas
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
            <h2>⚙️ Gestionar Tareas</h2>
            <p className="text-muted mb-0">Vista completa con opciones de edición, eliminación y cambios rápidos</p>
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
            <div className="spinner-border text-secondary" role="status">
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
              const canEdit = canEditTask(task);
              const canEditFull = canEditFullTask(task);
              const canStatus = canChangeStatus(task);
              const canDelete = canDeleteTask(task);
              
              // LOG TEMPORAL PARA DEBUGGING
              if (task.id === 1) { // Cambia por el ID de una tarea específica
                console.log('🔍 DEBUGGING TAREA', task.id);
                console.log('👤 Usuario actual:', currentUser?.id, currentUser?.username);
                console.log('📝 Creador de tarea:', task.created_by, task.created_by_username);
                console.log('👤 Asignado a:', task.assigned_to, task.assigned_to_username);
                console.log('✅ canEdit:', canEdit);
                console.log('✏️ canEditFull:', canEditFull);
                console.log('🔄 canStatus:', canStatus);
                console.log('🗑️ canDelete:', canDelete);
              }
              
              return (
                <div key={task.id} className="col-lg-6 col-xl-4 mb-4">
                  <div className="card h-100 shadow-sm border-secondary">
                    <div className="card-header bg-light">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="card-title mb-0 text-truncate" title={task.title}>
                          {task.title}
                        </h6>
                        <div className="dropdown">
                          <button 
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            disabled={!canEdit && !canDelete}
                          >
                            ⚙️
                          </button>
                          <ul className="dropdown-menu">
                            {canEditFull && (
                              <>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleEditTask(task.id)}
                                  >
                                    ✏️ Editar Completo
                                  </button>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                              </>
                            )}
                            {canStatus && (
                              <>
                                <li><h6 className="dropdown-header">Cambio de Estado:</h6></li>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleQuickStatusChange(task.id, 'pending', task.title)}
                                  >
                                    ⏳ Marcar Pendiente
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleQuickStatusChange(task.id, 'in_progress', task.title)}
                                  >
                                    🔄 Marcar En Progreso
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleQuickStatusChange(task.id, 'completed', task.title)}
                                  >
                                    ✅ Marcar Completada
                                  </button>
                                </li>
                              </>
                            )}
                            {canDelete && (
                              <>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                  <button 
                                    className="dropdown-item text-danger"
                                    onClick={() => handleDeleteTask(task.id, task.title)}
                                  >
                                    🗑️ Eliminar
                                  </button>
                                </li>
                              </>
                            )}
                            {!canEdit && !canDelete && (
                              <li><span className="dropdown-item-text text-muted">Sin permisos</span></li>
                            )}
                          </ul>
                        </div>
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
                    <div className="card-footer bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {canEditFull ? '✅ Control completo' : 
                           canStatus ? '🔄 Solo cambiar estado' : 
                           '🔒 Solo lectura'}
                        </small>
                        {canEditFull && (
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditTask(task.id)}
                          >
                            ✏️ Editar
                          </button>
                        )}
                        {!canEditFull && canStatus && (
                          <div className="btn-group">
                            <button 
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleQuickStatusChange(task.id, 'completed', task.title)}
                              title="Marcar completada"
                            >
                              ✅
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleQuickStatusChange(task.id, 'in_progress', task.title)}
                              title="Marcar en progreso"
                            >
                              🔄
                            </button>
                          </div>
                        )}
                      </div>
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
            <div className="card bg-light border-secondary">
              <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">📊 Resumen de Gestión</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-2">
                    <h5 className="text-secondary">{tasks.length}</h5>
                    <small className="text-muted">Total</small>
                  </div>
                  <div className="col-md-2">
                    <h5 className="text-warning">{tasks.filter(t => t.status === 'pending').length}</h5>
                    <small className="text-muted">Pendientes</small>
                  </div>
                  <div className="col-md-2">
                    <h5 className="text-info">{tasks.filter(t => t.status === 'in_progress').length}</h5>
                    <small className="text-muted">En progreso</small>
                  </div>
                  <div className="col-md-2">
                    <h5 className="text-success">{tasks.filter(t => t.status === 'completed').length}</h5>
                    <small className="text-muted">Completadas</small>
                  </div>
                  <div className="col-md-2">
                    <h5 className="text-primary">{tasks.filter(t => canEditTask(t)).length}</h5>
                    <small className="text-muted">Editables</small>
                  </div>
                  <div className="col-md-2">
                    <h5 className="text-danger">{tasks.filter(t => canDeleteTask(t)).length}</h5>
                    <small className="text-muted">Eliminables</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nota informativa */}
        <div className="mt-4">
          <div className="alert alert-secondary">
            <h6 className="alert-heading">⚙️ Información de Gestión</h6>
            <p className="mb-0">
              En esta vista puedes <strong>gestionar completamente</strong> las tareas: editar, cambiar estados rápidamente, 
              eliminar y más. Los permisos dependen de tu rol y relación con cada tarea.
              <br />
              <strong>Cambios rápidos:</strong> Usa el menú desplegable para cambiar el estado sin abrir el editor completo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTasks;