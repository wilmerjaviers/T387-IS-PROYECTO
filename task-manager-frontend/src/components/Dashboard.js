import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import tasksService from '../services/tasksService';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await tasksService.getAllTasks();
      const tasks = response.tasks;
      
      setStats({
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      authService.logout();
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">
            Empresa de Desarrollo de Software
          </span>
          
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button 
                className="btn btn-outline-light dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown"
              >
                👤 {user?.username} ({user?.role})
              </button>
              <ul className="dropdown-menu">
                <li>
                  <span className="dropdown-item-text">
                    <small className="text-muted">{user?.email}</small>
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout}
                  >
                    🚪 Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            {/* Header de bienvenida */}
            <div className="card bg-primary text-white mb-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col">
                    <h1 className="h3 mb-1">
                      ¡Bienvenido, {user?.username}! 👋
                    </h1>
                    <p className="mb-0">
                      Rol: <span className="badge bg-light text-dark">{user?.role}</span>
                    </p>
                  </div>
                  <div className="col-auto">
                    <div className="fs-1">🎯</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas de tareas */}
            <div className="row mb-4">
              <div className="col-md-3 mb-3">
                <div className="card bg-info text-white">
                  <div className="card-body text-center">
                    <h2 className="mb-1">{loading ? '...' : stats.total}</h2>
                    <p className="mb-0">📋 Total de Tareas</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-warning text-dark">
                  <div className="card-body text-center">
                    <h2 className="mb-1">{loading ? '...' : stats.pending}</h2>
                    <p className="mb-0">⏳ Pendientes</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-primary text-white">
                  <div className="card-body text-center">
                    <h2 className="mb-1">{loading ? '...' : stats.in_progress}</h2>
                    <p className="mb-0">🔄 En Progreso</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-success text-white">
                  <div className="card-body text-center">
                    <h2 className="mb-1">{loading ? '...' : stats.completed}</h2>
                    <p className="mb-0">✅ Completadas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones principales */}
            <div className="row">
              <div className="col-lg-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <span className="display-3">➕</span>
                    </div>
                    <h5 className="card-title">Añadir Tareas</h5>
                    <p className="card-text text-muted">
                      Crea nuevas tareas, asígnalas a usuarios y establece prioridades.
                    </p>
                    <button 
                      className="btn btn-primary w-100"
                      onClick={() => navigate('/tasks/add')}
                    >
                      ➕ Crear Nueva Tarea
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <span className="display-3">👁️</span>
                    </div>
                    <h5 className="card-title">Ver Tareas</h5>
                    <p className="card-text text-muted">
                      Vista de solo lectura para consultar el estado de las tareas.
                    </p>
                    <button 
                      className="btn btn-info w-100"
                      onClick={() => navigate('/tasks')}
                    >
                      👁️ Ver Todas las Tareas
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <span className="display-3">⚙️</span>
                    </div>
                    <h5 className="card-title">Gestionar Tareas</h5>
                    <p className="card-text text-muted">
                      Edita, actualiza el estado y elimina tareas. Control completo.
                    </p>
                    <button 
                      className="btn btn-secondary w-100"
                      onClick={() => navigate('/tasks/manage')}
                    >
                      ⚙️ Gestionar Tareas
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel adicional para admins */}
            {user?.role === 'admin' && (
              <div className="mt-4">
                <div className="card border-warning">
                  <div className="card-header bg-warning text-dark">
                    <h5 className="mb-0">👑 Panel de Administrador</h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-3">Como administrador tienes acceso completo a todas las funcionalidades:</p>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center">
                          <span className="me-3">✅</span>
                          <span>Ver y gestionar todas las tareas</span>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center">
                          <span className="me-3">✅</span>
                          <span>Asignar tareas a cualquier usuario</span>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center">
                          <span className="me-3">✅</span>
                          <span>Eliminar cualquier tarea</span>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center">
                          <span className="me-3">✅</span>
                          <span>Gestionar usuarios del sistema</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información del sistema */}
            <div className="mt-4">
              <div className="card bg-light">
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-4">
                      <h6 className="text-primary">🎯 Estado del Sistema</h6>
                      <p className="mb-0 text-success">✅ Operativo</p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-primary">👤 Usuario Activo</h6>
                      <p className="mb-0">{user?.username}</p>
                    </div>
                    <div className="col-md-4">
                      <h6 className="text-primary">🕒 Última Actualización</h6>
                      <p className="mb-0">{new Date().toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;