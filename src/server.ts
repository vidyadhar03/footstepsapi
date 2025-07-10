import app from "./app";

const port = process.env.PORT ? +process.env.PORT : 3000;

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
}

// Export the app for serverless environments (like Vercel)
export default app;
