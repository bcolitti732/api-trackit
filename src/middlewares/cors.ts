import cors from 'cors';

const corsOptions = {
    origin: ['http://localhost:4200', 'http://localhost:3000'], // Permitir múltiples orígenes
    optionsSuccessStatus: 200,
};

export default cors(corsOptions);