"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const auth_1 = require("./middleware/auth");
const routes_1 = __importDefault(require("./routes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
// Routes
app.use("/api", routes_1.default);
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // or SUPABASE_SERVICE_ROLE_KEY for service role
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
}
app.get("/", (_req, res) => {
    res.json({ message: "Hello from Express + TypeScript!" });
});
app.get("/api/test-supabase", async (_req, res) => {
    try {
        // Check if environment variables are set
        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({
                success: false,
                message: "Supabase configuration missing",
                details: {
                    hasUrl: !!supabaseUrl,
                    hasKey: !!supabaseKey,
                    missingVars: [
                        ...(!supabaseUrl ? ["SUPABASE_URL"] : []),
                        ...(!supabaseKey ? ["SUPABASE_ANON_KEY"] : [])
                    ]
                }
            });
        }
        // Test the connection by attempting to fetch from auth admin (this will work even without authentication)
        const { data, error } = await supabase.auth.getSession();
        // If we got here without throwing, the connection is working
        // Even if there's no session, it means we can communicate with Supabase
        return res.json({
            success: true,
            message: "Supabase connection successful",
            details: {
                supabaseUrl: supabaseUrl,
                connectionTest: "passed",
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error("Supabase connection error:", error);
        return res.status(500).json({
            success: false,
            message: "Supabase connection failed",
            error: error instanceof Error ? error.message : "Unknown error",
            details: {
                supabaseUrl: supabaseUrl,
                timestamp: new Date().toISOString()
            }
        });
    }
});
app.get("/api/test-prisma", async (_req, res) => {
    try {
        // Test database connection by counting UserProfile records
        const userCount = await prisma_1.default.userProfile.count();
        // Test creating a sample record (and then delete it)
        const testProfile = await prisma_1.default.userProfile.create({
            data: {
                authUserId: `test-${Date.now()}`,
                name: "Test User",
                origin: "Test Location",
                styleTags: ["Testing"],
                totalKm: 100.5,
                totalCountries: 5,
                earthRotations: 2
            }
        });
        // Clean up - delete the test record
        await prisma_1.default.userProfile.delete({
            where: { id: testProfile.id }
        });
        return res.json({
            success: true,
            message: "Prisma connection successful",
            details: {
                totalUsers: userCount,
                testRecordCreated: testProfile.id,
                testRecordDeleted: true,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error("Prisma connection error:", error);
        return res.status(500).json({
            success: false,
            message: "Prisma connection failed",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString()
        });
    }
});
app.get("/api/test-auth", auth_1.authenticateJWT, async (req, res) => {
    try {
        // This route is protected - user must be authenticated
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
                timestamp: new Date().toISOString()
            });
        }
        return res.json({
            success: true,
            message: "Authentication successful",
            user: {
                uid: user.uid,
                email: user.email,
                role: user.role
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error("Test auth error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            timestamp: new Date().toISOString()
        });
    }
});
app.get("/api/public-data", auth_1.optionalAuthenticateJWT, async (req, res) => {
    try {
        const user = req.user; // May be undefined if not authenticated
        return res.json({
            success: true,
            message: "Public data endpoint",
            authenticated: !!user,
            user: user ? { uid: user.uid, email: user.email } : null,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error("Public data error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            timestamp: new Date().toISOString()
        });
    }
});
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        supabaseConfigured: !!(supabaseUrl && supabaseKey),
        prismaConnected: true
    });
});
exports.default = app;
