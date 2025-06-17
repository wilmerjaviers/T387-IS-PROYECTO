const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener usuarios activos para asignar tareas
router.get('/users/active', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT u.id, u.username, u.email, r.name as role 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.is_active = TRUE 
             ORDER BY u.username`
        );

        res.json({
            success: true,
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

// Obtener todas las tareas
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, priority, assigned_to } = req.query;
        let query = `
            SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, 
                   t.created_at, t.updated_at, t.created_by, t.assigned_to,
                   creator.username as created_by_username,
                   assignee.username as assigned_to_username
            FROM tasks t
            LEFT JOIN users creator ON t.created_by = creator.id
            LEFT JOIN users assignee ON t.assigned_to = assignee.id
            WHERE 1=1
        `;
        const params = [];

        // Filtros opcionales
        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }
        if (priority) {
            query += ' AND t.priority = ?';
            params.push(priority);
        }
        if (assigned_to) {
            query += ' AND t.assigned_to = ?';
            params.push(assigned_to);
        }

        // Si no es admin, solo ver sus tareas asignadas o creadas
        if (req.user.role !== 'admin') {
            query += ' AND (t.assigned_to = ? OR t.created_by = ?)';
            params.push(req.user.id, req.user.id);
        }

        query += ' ORDER BY t.created_at DESC';

        const [tasks] = await pool.execute(query, params);

        res.json({
            success: true,
            tasks: tasks,
            count: tasks.length
        });

    } catch (error) {
        console.error('Error al obtener tareas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Crear nueva tarea
router.post('/', authenticateToken, [
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('El título es requerido y debe tener máximo 255 caracteres'),
    body('description').optional().trim(),
    body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Estado inválido'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Prioridad inválida'),
    body('assigned_to').optional().isInt().withMessage('ID de usuario asignado debe ser un número'),
    body('due_date').optional().isISO8601().withMessage('Fecha de vencimiento debe ser válida')
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

        const { title, description, status = 'pending', priority = 'medium', assigned_to, due_date } = req.body;

        // Verificar que el usuario asignado existe (si se proporciona)
        if (assigned_to) {
            const [users] = await pool.execute(
                'SELECT id FROM users WHERE id = ? AND is_active = TRUE',
                [assigned_to]
            );
            if (users.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El usuario asignado no existe o está inactivo'
                });
            }
        }

        const [result] = await pool.execute(
            'INSERT INTO tasks (title, description, status, priority, assigned_to, created_by, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, status, priority, assigned_to || null, req.user.id, due_date || null]
        );

        res.status(201).json({
            success: true,
            message: 'Tarea creada exitosamente',
            taskId: result.insertId
        });

    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Obtener una tarea específica
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);

        const [tasks] = await pool.execute(
            `SELECT t.*, 
                    creator.username as created_by_username,
                    assignee.username as assigned_to_username
             FROM tasks t
             LEFT JOIN users creator ON t.created_by = creator.id
             LEFT JOIN users assignee ON t.assigned_to = assignee.id
             WHERE t.id = ?`,
            [taskId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        const task = tasks[0];

        // Verificar permisos: admin, creador o asignado
        if (req.user.role !== 'admin' && 
            task.created_by !== req.user.id && 
            task.assigned_to !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver esta tarea'
            });
        }

        res.json({
            success: true,
            task: task
        });

    } catch (error) {
        console.error('Error al obtener tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Actualizar tarea
router.put('/:id', authenticateToken, [
    body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('El título debe tener máximo 255 caracteres'),
    body('description').optional().trim(),
    body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Estado inválido'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Prioridad inválida'),
    body('assigned_to').optional().isInt().withMessage('ID de usuario asignado debe ser un número'),
    body('due_date').optional().isISO8601().withMessage('Fecha de vencimiento debe ser válida')
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

        const taskId = parseInt(req.params.id);
        const { title, description, status, priority, assigned_to, due_date } = req.body;

        // Verificar que la tarea existe
        const [existingTasks] = await pool.execute(
            'SELECT * FROM tasks WHERE id = ?',
            [taskId]
        );

        if (existingTasks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        const task = existingTasks[0];

        // Verificar permisos: admin, creador o asignado
        if (req.user.role !== 'admin' && 
            task.created_by !== req.user.id && 
            task.assigned_to !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para editar esta tarea'
            });
        }

        // Construir query de actualización dinámicamente
        const updateFields = [];
        const updateValues = [];

        if (title !== undefined) {
            updateFields.push('title = ?');
            updateValues.push(title);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }
        if (priority !== undefined) {
            updateFields.push('priority = ?');
            updateValues.push(priority);
        }
        if (assigned_to !== undefined) {
            updateFields.push('assigned_to = ?');
            updateValues.push(assigned_to);
        }
        if (due_date !== undefined) {
            updateFields.push('due_date = ?');
            updateValues.push(due_date);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar'
            });
        }

        updateValues.push(taskId);

        await pool.execute(
            `UPDATE tasks SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            updateValues
        );

        res.json({
            success: true,
            message: 'Tarea actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Eliminar tarea
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);

        // Verificar que la tarea existe
        const [existingTasks] = await pool.execute(
            'SELECT * FROM tasks WHERE id = ?',
            [taskId]
        );

        if (existingTasks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        const task = existingTasks[0];

        // Solo admin o creador pueden eliminar
        if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar esta tarea'
            });
        }

        await pool.execute('DELETE FROM tasks WHERE id = ?', [taskId]);

        res.json({
            success: true,
            message: 'Tarea eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;