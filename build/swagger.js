"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
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
                    required: ['name', 'description', 'status'],
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
                    },
                },
                User: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'phone', 'available', 'packets', 'birthdate'],
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
                        packets: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                        birthdate: {
                            type: 'string',
                            format: 'date',
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
                    required: ['name', 'email', 'password', 'phone', 'available', 'packets', 'birthdate'],
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
                        packets: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                        birthdate: {
                            type: 'string',
                            format: 'date',
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
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
function setupSwagger(app) {
    console.log('Setting up Swagger');
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
}
//# sourceMappingURL=swagger.js.map