"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticateJWT = exports.authenticateJWT = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
/**
 * JWT Authentication Middleware
 * Validates JWT token from Authorization header with Supabase
 * Adds user data to req.user for downstream routes
 */
const authenticateJWT = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            const error = {
                code: 'MISSING_TOKEN',
                message: 'Authorization header is required',
                status: 401
            };
            res.status(401).json({
                success: false,
                error: error.code,
                message: error.message
            });
            return;
        }
        // Check if header follows "Bearer <token>" format
        const tokenParts = authHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            const error = {
                code: 'INVALID_TOKEN_FORMAT',
                message: 'Authorization header must be in format: Bearer <token>',
                status: 401
            };
            res.status(401).json({
                success: false,
                error: error.code,
                message: error.message
            });
            return;
        }
        const token = tokenParts[1];
        // Validate token with Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            const error = {
                code: 'INVALID_TOKEN',
                message: authError?.message || 'Invalid or expired token',
                status: 401
            };
            res.status(401).json({
                success: false,
                error: error.code,
                message: error.message
            });
            return;
        }
        // Add user data to request object
        req.user = {
            uid: user.id,
            email: user.email || undefined,
            role: user.role || undefined
        };
        // Continue to next middleware/route
        next();
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        const authError = {
            code: 'AUTH_ERROR',
            message: 'Authentication failed',
            status: 500
        };
        res.status(500).json({
            success: false,
            error: authError.code,
            message: authError.message
        });
    }
};
exports.authenticateJWT = authenticateJWT;
/**
 * Optional JWT Authentication Middleware
 * Similar to authenticateJWT but doesn't fail if no token provided
 * Useful for routes that work with or without authentication
 */
const optionalAuthenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // If no auth header, continue without user data
        if (!authHeader) {
            next();
            return;
        }
        // Try to authenticate, but don't fail if it doesn't work
        const tokenParts = authHeader.split(' ');
        if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
            const token = tokenParts[1];
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);
            if (!authError && user) {
                req.user = {
                    uid: user.id,
                    email: user.email || undefined,
                    role: user.role || undefined
                };
            }
        }
        next();
    }
    catch (error) {
        console.error('Optional authentication middleware error:', error);
        // Continue without authentication for optional middleware
        next();
    }
};
exports.optionalAuthenticateJWT = optionalAuthenticateJWT;
