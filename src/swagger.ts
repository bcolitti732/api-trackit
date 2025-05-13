import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CRUD API',
            version: '1.0.0',
            description: 'API documentation for the CRUD application',
        },
        servers: [
            {
                url: 'http://localhost:4000',
            },
        ],
        components: {
            schemas: {
                Packet: {
                    type: 'object',
                    required: ['name', 'description', 'status', 'createdAt', 'deliveredAt', 'size', 'weight', 'origin'],
                    properties: {
                        name: {
                            type: 'string',
                        },
                        description: {
                            type: 'string',
                        },
                        status: {
                            type: 'string',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        deliveredAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        size: {
                            type: 'number',
                        },
                        weight: {
                            type: 'number',
                        },
                        deliveryId: {
                            type: 'string',
                        },
                        origin: {
                            type: 'string',
                        },
                        destination: {
                            type: 'string',
                        },
                        location: {
                            type: 'string',
                        },

                    },
                },
                User: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'phone', 'available', 'birthdate', 'role'],
                    properties: {
                        name: {
                            type: 'string',
                        },
                        email: {
                            type: 'string',
                        },
                        password: {
                            type: 'string',
                        },
                        phone: {
                            type: 'string',
                        },
                        available: {
                            type: 'boolean',
                        },
                        birthdate: {
                            type: 'string',
                            format: 'date',
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'user', 'delivery'],
                        },
                        packets: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                        deliveryProfileId: {
                            type: 'string',
                        },
                    },
                },
                Delivery: {
                    type: 'object',
                    required: ['userId', 'assignedPacket', 'vehicle'],
                    properties: {
                        userId: {
                            type: 'string',
                        },
                        assignedPacket: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                        deliveredPackets: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                        vehicle: {
                            type: 'string',
                        },
                    },
                },
                AuthTokens: {
                    type: 'object',
                    properties: {
                        accessToken: {
                            type: 'string',
                        },
                        refreshToken: {
                            type: 'string',
                        },
                    },
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'phone', 'available', 'packets', 'birthdate', 'role'],
                    properties: {
                        name: {
                            type: 'string',
                        },
                        email: {
                            type: 'string',
                        },
                        password: {
                            type: 'string',
                        },
                        phone: {
                            type: 'string',
                        },
                        available: {
                            type: 'boolean',
                        },
                        birthdate: {
                            type: 'string',
                            format: 'date',
                        },
                        packets: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'user', 'delivery'],
                        },
                        deliveryProfileId: {
                            type: 'string',
                        },

                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                        },
                        password: {
                            type: 'string',
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Swagger generará la documentación desde los comentarios
};
const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Application): void {
    console.log('Setting up Swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}