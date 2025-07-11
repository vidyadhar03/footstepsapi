"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const port = process.env.PORT ? +process.env.PORT : 3000;
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`Environment: ${nodeEnv}`);
// Start the server for local development
app_1.default.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
    console.log(`Environment: ${nodeEnv}`);
});
// Export the app for serverless environments (like Vercel)
exports.default = app_1.default;
