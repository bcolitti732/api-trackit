import cors from 'cors';

const allowedOrigins = [
    'http://192.168.10.71:4001',
    'http://192.168.10.71:4000',
    'http://192.168.10.71:4005',
    'http://192.168.10.71:4002',
    'http://ea4-api.upc.edu',
    'http://ea4-api.upc.edu:4000',
    'http://ea4-api.upc.edu:4005',
    'http://ea4.upc.edu',
    'http://ea4-back.upc.edu',
];

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || origin.startsWith('http://localhost') || allowedOrigins.includes(origin)) {
            callback(null, true); // Permitir localhost y las rutas específicas
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};

export default cors(corsOptions);