import { OpenAPIV3 } from 'openapi-types';

const swaggerSpec: OpenAPIV3.Document = {
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
  paths: {
    '/': {
      get: {
        summary: 'Welcome message',
        description: 'Returns a welcome message for the API',
        tags: ['General'],
        responses: {
          '200': {
            description: 'Welcome message',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Hello from Express + TypeScript!',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/health': {
      get: {
        summary: 'Health check',
        description: 'Returns the current health status of the API',
        tags: ['General'],
        responses: {
          '200': {
            description: 'API health status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                    },
                    supabaseConfigured: {
                      type: 'boolean',
                    },
                    prismaConnected: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/test-supabase': {
      get: {
        summary: 'Test Supabase connection',
        description: 'Verifies that the API can connect to Supabase',
        tags: ['Testing'],
        responses: {
          '200': {
            description: 'Supabase connection successful',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        details: {
                          type: 'object',
                          properties: {
                            supabaseUrl: { type: 'string' },
                            connectionTest: { type: 'string', example: 'passed' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '500': {
            description: 'Supabase connection failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/test-prisma': {
      get: {
        summary: 'Test Prisma database connection',
        description: 'Verifies that the API can connect to the database via Prisma',
        tags: ['Testing'],
        responses: {
          '200': {
            description: 'Prisma connection successful',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        details: {
                          type: 'object',
                          properties: {
                            totalUsers: { type: 'integer' },
                            testRecordCreated: { type: 'string' },
                            testRecordDeleted: { type: 'boolean' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '500': {
            description: 'Prisma connection failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/test-auth': {
      get: {
        summary: 'Test JWT authentication',
        description: 'Protected endpoint to test JWT token validation',
        tags: ['Testing'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            uid: { type: 'string' },
                            email: { type: 'string' },
                            role: { type: 'string' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'Authentication failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/public-data': {
      get: {
        summary: 'Public endpoint with optional authentication',
        description: 'Demonstrates optional authentication - works with or without JWT token',
        tags: ['Testing'],
        security: [{ BearerAuth: [] }, {}],
        responses: {
          '200': {
            description: 'Public data retrieved',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        authenticated: { type: 'boolean' },
                        user: {
                          type: 'object',
                          nullable: true,
                          properties: {
                            uid: { type: 'string' },
                            email: { type: 'string' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/api/profile': {
      post: {
        summary: 'Create or update user profile (Upsert)',
        description: `Creates a new user profile or updates an existing one based on the JWT token's user ID.
This endpoint should be called immediately after user login/signup to ensure profile exists.

**Behavior:**
- If profile doesn't exist: Creates new profile with provided data
- If profile exists: Updates existing profile with new data
- Returns \`isNewProfile: true\` for newly created profiles
- Returns \`isNewProfile: false\` for updated profiles`,
        tags: ['User Profile'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserProfileInput' },
              example: {
                name: 'John Doe',
                origin: 'New York',
                styleTags: ['Backpacking', 'Adventure'],
                totalKm: 0.0,
                totalCountries: 0,
                earthRotations: 0,
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profile created or updated successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/UserProfile' },
                        isNewProfile: {
                          type: 'boolean',
                          description: 'True if profile was created, false if updated',
                        },
                      },
                    },
                  ],
                },
                examples: {
                  newProfile: {
                    summary: 'New profile created',
                    value: {
                      success: true,
                      message: 'Profile created successfully',
                      data: {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        authUserId: 'user-uid-from-jwt',
                        name: 'John Doe',
                        origin: 'New York',
                        styleTags: ['Backpacking', 'Adventure'],
                        totalKm: 0,
                        totalCountries: 0,
                        earthRotations: 0,
                        createdAt: '2024-01-01T12:00:00.000Z',
                        updatedAt: '2024-01-01T12:00:00.000Z',
                      },
                      isNewProfile: true,
                      timestamp: '2024-01-01T12:00:00.000Z',
                    },
                  },
                  updatedProfile: {
                    summary: 'Existing profile updated',
                    value: {
                      success: true,
                      message: 'Profile updated successfully',
                      data: {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        authUserId: 'user-uid-from-jwt',
                        name: 'John Doe Updated',
                        origin: 'Los Angeles',
                        styleTags: ['Backpacking', 'Adventure', 'Photography'],
                        totalKm: 150.5,
                        totalCountries: 3,
                        earthRotations: 1,
                        createdAt: '2024-01-01T12:00:00.000Z',
                        updatedAt: '2024-01-02T12:00:00.000Z',
                      },
                      isNewProfile: false,
                      timestamp: '2024-01-02T12:00:00.000Z',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  message: 'Name is required and must be a string',
                  timestamp: '2024-01-01T12:00:00.000Z',
                },
              },
            },
          },
          '401': {
            description: 'User not authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/profile/user/profile': {
      get: {
        summary: 'Get current user profile',
        description: "Retrieves the authenticated user's profile from the database",
        tags: ['User Profile'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/UserProfile' },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'User not authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User profile not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerSpec; 