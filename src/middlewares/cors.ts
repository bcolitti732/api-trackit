import cors from 'cors';

const corsOptions = {
    origin: ['http://localhost:4200', 'http://localhost:3000', 'http://localhost:5000', 'http://192.168.10.71:4001'], // Permitir múltiples orígenes
    credentials: true, // Permitir el envío de cookies o encabezados de autorización
    optionsSuccessStatus: 200, // Para navegadores antiguos que devuelven 204
};

export default cors(corsOptions);