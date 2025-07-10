"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Footsteps API',
        version: '1.0.0',
        description: 'Backend API for Footsteps travel tracking app',
        contact: {
            name: 'Footsteps Team',
            url: 'https://footstepsapi.vercel.app',
        },
    },
    servers: [
        {
            url: 'https://footstepsapi.vercel.app',
            description: 'Production server',
        },
        {
            url: 'http://localhost:3000',
            description: 'Development server',
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT token from Supabase authentication',
            },
        },
        schemas: {
            UserProfile: {
                type: 'object',
                required: ['id', 'authUserId', 'name'],
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Unique profile ID',
                    },
                    authUserId: {
                        type: 'string',
                        description: 'Supabase auth user ID',
                    },
                    name: {
                        type: 'string',
                        description: 'User display name',
                    },
                    origin: {
                        type: 'string',
                        nullable: true,
                        description: 'User origin location',
                    },
                    styleTags: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        description: 'Travel style tags (e.g., Backpacking, Trekking)',
                    },
                    totalKm: {
                        type: 'number',
                        format: 'float',
                        description: 'Total kilometers traveled',
                    },
                    totalCountries: {
                        type: 'integer',
                        description: 'Number of countries visited',
                    },
                    earthRotations: {
                        type: 'integer',
                        description: 'Number of earth rotations',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Profile creation timestamp',
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Profile last update timestamp',
                    },
                },
            },
            UserProfileInput: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: {
                        type: 'string',
                        description: 'User display name',
                        example: 'John Doe',
                    },
                    origin: {
                        type: 'string',
                        nullable: true,
                        description: 'User origin location',
                        example: 'New York',
                    },
                    styleTags: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        description: 'Travel style tags',
                        example: ['Backpacking', 'Adventure'],
                    },
                    totalKm: {
                        type: 'number',
                        format: 'float',
                        description: 'Total kilometers traveled',
                        example: 0.0,
                    },
                    totalCountries: {
                        type: 'integer',
                        description: 'Number of countries visited',
                        example: 0,
                    },
                    earthRotations: {
                        type: 'integer',
                        description: 'Number of earth rotations',
                        example: 0,
                    },
                },
            },
            SuccessResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: true,
                    },
                    message: {
                        type: 'string',
                        example: 'Operation completed successfully',
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                    },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false,
                    },
                    error: {
                        type: 'string',
                        example: 'ERROR_CODE',
                    },
                    message: {
                        type: 'string',
                        example: 'Error description',
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                    },
                },
            },
        },
    },
    security: [
        {
            BearerAuth: [],
        },
    ],
};
const options = {
    definition: swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: [
        './src/routes/*.ts',
        './src/app.ts',
        './dist/routes/*.js',
        './dist/app.js',
    ],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
