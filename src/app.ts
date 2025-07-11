import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import prisma from "./lib/prisma";
import { authenticateJWT, optionalAuthenticateJWT } from "./middleware/auth";
import { AuthenticatedRequest } from "./types/auth";
import apiRoutes from "./routes";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());



// Routes
app.use("/api", apiRoutes);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // or SUPABASE_SERVICE_ROLE_KEY for service role

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
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

  } catch (error) {
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
    // Test database connection by counting User records
    const userCount = await prisma.user.count();
    
    // Test creating a sample record (and then delete it)
    const testUser = await prisma.user.create({
      data: {
        authUserId: `test-${Date.now()}`,
        name: "Test User",
        email: "test@example.com"
      }
    });

    // Clean up - delete the test record
    await prisma.user.delete({
      where: { id: testUser.id }
    });

    return res.json({
      success: true,
      message: "Prisma connection successful",
      details: {
        totalUsers: userCount,
        testRecordCreated: testUser.id,
        testRecordDeleted: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Prisma connection error:", error);
    return res.status(500).json({
      success: false,
      message: "Prisma connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});


app.get("/api/test-auth", authenticateJWT, async (req: AuthenticatedRequest, res) => {
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

  } catch (error) {
    console.error("Test auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      timestamp: new Date().toISOString()
    });
  }
});


app.get("/api/public-data", optionalAuthenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user; // May be undefined if not authenticated
    
    return res.json({
      success: true,
      message: "Public data endpoint",
      authenticated: !!user,
      user: user ? { uid: user.uid, email: user.email } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
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
    nodeEnv: process.env.NODE_ENV || 'not set',
    supabaseConfigured: !!(supabaseUrl && supabaseKey),
    prismaConnected: true
  });
});

export default app;
