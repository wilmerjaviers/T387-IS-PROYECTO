# Sistema de Gestión de Tareas | Grupo: Paola & Wilmer

Un sistema web completo para gestionar tareas en empresas de desarrollo de software, construido con React, Node.js y MySQL.

## Características Principales

- **Autenticación segura** con JWT
- **Sistema de roles** (Administrador y Desarrollador)
- **Gestión completa de tareas** (Crear, Ver, Editar, Eliminar)
- **Asignación de tareas** a usuarios específicos
- **Dashboard con estadísticas** en tiempo real
- **Diseño responsive** para móviles y desktop
- **Interfaz moderna** con Bootstrap

## Tecnologías Utilizadas

### Backend
- **Node.js** + **Express.js**
- **MySQL** (Base de datos)
- **JWT** (Autenticación)
- **bcrypt** (Encriptación de contraseñas)

### Frontend
- **React 18**
- **Bootstrap 5** (Diseño)
- **SweetAlert2** (Alertas)
- **Axios** (HTTP Client)

## Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/task-manager.git
cd task-manager
```

### 2. Configurar Backend
```bash
cd task-manager-backend
npm install
```

Crear archivo `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=task_management
JWT_SECRET=tu_jwt_secret_aqui
```

Crear base de datos en MySQL:
```bash
mysql -u root -p
source database.sql
```

Ejecutar backend:
```bash
npm start
```

### 3. Configurar Frontend
```bash
cd ../task-manager-frontend
npm install
npm start
```

## Uso de la Aplicación

### Usuario por Defecto
- **Usuario:** `admin`
- **Contraseña:** `admin123`

### Dashboard Principal
Después del login, accede a:
- **Añadir Tareas:** Crear nuevas tareas
- **Ver Tareas:** Consultar tareas (solo lectura)
- **Gestionar Tareas:** Editar y administrar tareas

### Roles de Usuario

**Administrador:**
- Ver todas las tareas
- Crear, editar y eliminar cualquier tarea
- Asignar tareas a cualquier usuario
- Registrar nuevos usuarios

**Desarrollador:**
- Ver solo tareas asignadas o creadas por él
- Cambiar estado de tareas asignadas
- Crear nuevas tareas
- Editar solo tareas propias

## Capturas de Pantalla

### Login
- Página de inicio con fondo personalizable
- Formulario de autenticación seguro

### Dashboard
- Estadísticas de tareas en tiempo real
- Navegación intuitiva a todas las funciones

### Gestión de Tareas
- Lista de tareas con filtros
- Cards interactivas con opciones de gestión
- Cambio rápido de estados

## Características de Seguridad

- **Contraseñas encriptadas** con bcrypt
- **Tokens JWT** con expiración de 24h
- **Validación de datos** en frontend y backend
- **Protección de rutas** según roles de usuario
- **Prevención de SQL Injection**

## Estructura del Proyecto

```
task-manager/
├── task-manager-backend/
│   ├── config/         # Configuración de base de datos
│   ├── middleware/     # Middlewares de autenticación
│   ├── routes/         # Rutas de API
│   ├── server.js       # Servidor principal
│   └── database.sql    # Esquema de base de datos
└── task-manager-frontend/
    ├── src/
    │   ├── components/ # Componentes React
    │   └── services/   # Servicios API
    └── public/         # Archivos estáticos
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil

### Tareas
- `GET /api/tasks` - Listar tareas
- `POST /api/tasks` - Crear tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea

## Funcionalidades Destacadas

### Dashboard Inteligente
- Estadísticas en tiempo real
- Navegación contextual según rol
- Panel especial para administradores

### Gestión Avanzada
- Filtros por estado, prioridad y usuario
- Cambio rápido de estados
- Permisos granulares por rol

### Interfaz de Usuario
- Diseño moderno con Bootstrap
- Alertas elegantes con SweetAlert2
- Navegación intuitiva
- Responsive design

## Estados de Tareas

- **Pendiente** - Tarea recién creada
- **En Progreso** - Tarea siendo trabajada
- **Completada** - Tarea finalizada
- **Cancelada** - Tarea cancelada

## Prioridades

- **Alta** - Tareas urgentes
- **Media** - Tareas normales
- **Baja** - Tareas de menor importancia

## Solución de Problemas

### Backend no inicia
- Verificar que MySQL esté ejecutándose
- Comprobar credenciales en archivo `.env`
- Asegurar que la base de datos existe

### Frontend no se conecta
- Verificar que el backend esté en puerto 5000
- Comprobar configuración de proxy en `package.json`
- Revisar configuración de CORS

### Errores de autenticación
- Verificar que el JWT_SECRET esté configurado
- Comprobar que las credenciales sean correctas
- Revisar logs del servidor para más detalles

## Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación técnica

## Versión

**Versión actual:** 1.0.0
**Fecha de lanzamiento:** junio, 2025

---

