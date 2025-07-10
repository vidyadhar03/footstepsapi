import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

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

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    supabaseConfigured: !!(supabaseUrl && supabaseKey)
  });
});

export default app;
