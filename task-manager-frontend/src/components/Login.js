import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Swal from 'sweetalert2';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData.username, formData.password);
      
      
      await Swal.fire({
        title: '¡Bienvenido!',
        text: `Hola ${response.user.username}, has iniciado sesión correctamente`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      
      navigate('/dashboard');
      
    } catch (error) {
      
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        
        <div className="text-center mb-4">
          <h1 className="h2 text-primary mb-4">
          Empresa de Desarrollo de Software
          </h1>
         <p className="text-muted">---------------------------------------------------------------------------------</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body p-5">
                
                <div className="text-center mb-4">
                  <h2 className="h4 mb-2">Iniciar Sesión</h2>
                  <p className="text-muted">Sistema de Gestión de Tareas</p>
                </div>

                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Usuario
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      autoComplete="username"
                      placeholder="Ingresa tu usuario"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                      placeholder="Ingresa tu contraseña"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </button>
                </form>

           
              </div>
            </div>
          </div>
        </div>
        <p className="text-center mt-4">---------------------------------------------------------------------------------</p>
      </div>
    </div>
  );
};

export default Login;