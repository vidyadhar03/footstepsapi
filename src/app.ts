import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import prisma from "./lib/prisma";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

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

// Supabase connection test endpoint
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

// Prisma database test endpoint
app.get("/api/test-prisma", async (_req, res) => {
  try {
    // Test database connection by counting UserProfile records
    const userCount = await prisma.userProfile.count();
    
    // Test creating a sample record (and then delete it)
    const testProfile = await prisma.userProfile.create({
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
    await prisma.userProfile.delete({
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

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    supabaseConfigured: !!(supabaseUrl && supabaseKey),
    prismaConnected: true
  });
});

export default app;
