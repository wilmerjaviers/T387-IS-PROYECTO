const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();


router.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').isIn(['admin', 'developer']).withMessage('El rol debe ser admin o developer')
], async (req, res) => {
    try {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const { username, email, password, role } = req.body;

        
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El usuario o email ya existe'
            });
        }

       
        const [roles] = await pool.execute(
            'SELECT id FROM roles WHERE name = ?',
            [role]
        );

        if (roles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Rol no válido'
            });
        }

       
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, roles[0].id]
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Iniciar sesión
router.post('/login', [
    body('username').notEmpty().withMessage('El nombre de usuario es requerido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
], async (req, res) => {
    try {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

       
        const [users] = await pool.execute(
            `SELECT u.id, u.username, u.email, u.password, u.is_active, r.name as role 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.username = ? AND u.is_active = TRUE`,
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const user = users[0];

       
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

      
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Obtener perfil del usuario actual
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Obtener todos los usuarios (solo para administradores)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo los administradores pueden ver todos los usuarios'
            });
        }

        // Obtener todos los usuarios con sus roles
        const [users] = await pool.execute(
            `SELECT u.id, u.username, u.email, u.is_active, u.created_at, u.updated_at, r.name as role 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             ORDER BY u.created_at DESC`
        );

        res.json({
            success: true,
            message: 'Usuarios obtenidos exitosamente',
            count: users.length,
            users: users
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Cerrar sesión)
router.post('/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
    });
});

module.exports = router;