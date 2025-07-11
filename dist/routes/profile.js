"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
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
