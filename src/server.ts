import app from "./app";

const port = process.env.PORT ? +process.env.PORT : 3000;
const nodeEnv = process.env.NODE_ENV || 'development';

console.log(`Environment: ${nodeEnv}`);

// Start the server for local development
app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
  console.log(`Environment: ${nodeEnv}`);
});

// Export the app for serverless environments (like Vercel)
export default app;
