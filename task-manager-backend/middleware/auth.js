const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');


const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token de acceso requerido' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        
        const [users] = await pool.execute(
            `SELECT u.id, u.username, u.email, u.is_active, r.name as role 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.id = ? AND u.is_active = TRUE`,
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuario no válido o inactivo' 
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Token no válido' 
        });
    }
};


const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Acceso denegado. Se requieren privilegios de administrador' 
        });
    }
    next();
};


const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Acceso denegado. Rol insuficiente' 
            });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireRole
};