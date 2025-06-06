import React from 'react';
import authService from '../services/authService';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const user = authService.getCurrentUser();

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
    
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">
            📋 Task Manager
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

      
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            
            <div className="card bg-primary text-white mb-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col">
                    <h1 className="h3 mb-1">
                      ¡Bienvenido(a), {user?.username}! 👋
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

            
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <div className="display-1 text-muted">📝</div>
                </div>
                <h2 className="h4 text-muted mb-3">
                  Dashboard de Tareas
                </h2>
                <p className="text-muted mb-4">
                  Aquí aparecerá el sistema de gestión de tareas.<br />
                  ¡Próximamente agregaremos toda la funcionalidad!
                </p>
                
                
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <button className="btn btn-outline-primary" disabled>
                    ➕ Crear Tarea
                  </button>
                  <button className="btn btn-outline-secondary" disabled>
                    📋 Ver Tareas
                  </button>
                  <button className="btn btn-outline-info" disabled>
                    👥 Gestionar Usuarios
                  </button>
                </div>

                <div className="mt-4 p-3 bg-light rounded">
                  <small className="text-muted">
                    <strong>Estado:</strong> ✅ Login funcionando correctamente<br />
                    <strong>Siguiente paso:</strong> Implementar CRUD de tareas
                  </small>
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