"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/profile/user/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the authenticated user's profile from the database
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/user/profile", auth_1.authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
                timestamp: new Date().toISOString()
            });
        }
        // Find user profile by authUserId
        const userProfile = await prisma_1.default.userProfile.findUnique({
            where: { authUserId: user.uid }
        });
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: "User profile not found",
                timestamp: new Date().toISOString()
            });
        }
        return res.json({
            success: true,
            data: userProfile,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error("Get user profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create or update user profile (Upsert)
 *     description: |
 *       Creates a new user profile or updates an existing one based on the JWT token's user ID.
 *       This endpoint should be called immediately after user login/signup to ensure profile exists.
 *
 *       **Behavior:**
 *       - If profile doesn't exist: Creates new profile with provided data
 *       - If profile exists: Updates existing profile with new data
 *       - Returns `isNewProfile: true` for newly created profiles
 *       - Returns `isNewProfile: false` for updated profiles
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileInput'
 *           example:
 *             name: "John Doe"
 *             origin: "New York"
 *             styleTags: ["Backpacking", "Adventure"]
 *             totalKm: 0.0
 *             totalCountries: 0
 *             earthRotations: 0
 *     responses:
 *       200:
 *         description: Profile created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfile'
 *                     isNewProfile:
 *                       type: boolean
 *                       description: True if profile was created, false if updated
 *             examples:
 *               newProfile:
 *                 summary: New profile created
 *                 value:
 *                   success: true
 *                   message: "Profile created successfully"
 *                   data:
 *                     id: "123e4567-e89b-12d3-a456-426614174000"
 *                     authUserId: "user-uid-from-jwt"
 *                     name: "John Doe"
 *                     origin: "New York"
 *                     styleTags: ["Backpacking", "Adventure"]
 *                     totalKm: 0
 *                     totalCountries: 0
 *                     earthRotations: 0
 *                     createdAt: "2024-01-01T12:00:00.000Z"
 *                     updatedAt: "2024-01-01T12:00:00.000Z"
 *                   isNewProfile: true
 *                   timestamp: "2024-01-01T12:00:00.000Z"
 *               updatedProfile:
 *                 summary: Existing profile updated
 *                 value:
 *                   success: true
 *                   message: "Profile updated successfully"
 *                   data:
 *                     id: "123e4567-e89b-12d3-a456-426614174000"
 *                     authUserId: "user-uid-from-jwt"
 *                     name: "John Doe Updated"
 *                     origin: "Los Angeles"
 *                     styleTags: ["Backpacking", "Adventure", "Photography"]
 *                     totalKm: 150.5
 *                     totalCountries: 3
 *                     earthRotations: 1
 *                     createdAt: "2024-01-01T12:00:00.000Z"
 *                     updatedAt: "2024-01-02T12:00:00.000Z"
 *                   isNewProfile: false
 *                   timestamp: "2024-01-02T12:00:00.000Z"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Name is required and must be a string"
 *               timestamp: "2024-01-01T12:00:00.000Z"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", auth_1.authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
                timestamp: new Date().toISOString()
            });
        }
        // Extract profile data from request body
        const { name, origin, styleTags, totalKm, totalCountries, earthRotations } = req.body;
        // Validate required fields
        if (!name || typeof name !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Name is required and must be a string",
                timestamp: new Date().toISOString()
            });
        }
        // Validate optional fields with defaults
        const profileData = {
            name: name.trim(),
            origin: origin || null,
            styleTags: Array.isArray(styleTags) ? styleTags : [],
            totalKm: typeof totalKm === 'number' ? totalKm : 0,
            totalCountries: typeof totalCountries === 'number' ? totalCountries : 0,
            earthRotations: typeof earthRotations === 'number' ? earthRotations : 0
        };
        // Upsert user profile using Prisma
        const userProfile = await prisma_1.default.userProfile.upsert({
            where: {
                authUserId: user.uid
            },
            update: {
                // If profile exists, update it with new data
                name: profileData.name,
                origin: profileData.origin,
                styleTags: profileData.styleTags,
                totalKm: profileData.totalKm,
                totalCountries: profileData.totalCountries,
                earthRotations: profileData.earthRotations,
                updatedAt: new Date()
            },
            create: {
                // If profile doesn't exist, create new one
                authUserId: user.uid,
                name: profileData.name,
                origin: profileData.origin,
                styleTags: profileData.styleTags,
                totalKm: profileData.totalKm,
                totalCountries: profileData.totalCountries,
                earthRotations: profileData.earthRotations
            }
        });
        return res.json({
            success: true,
            message: userProfile.createdAt.getTime() === userProfile.updatedAt.getTime()
                ? "Profile created successfully"
                : "Profile updated successfully",
            data: userProfile,
            isNewProfile: userProfile.createdAt.getTime() === userProfile.updatedAt.getTime(),
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error("Upsert user profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
