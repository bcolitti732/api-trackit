import express, { RequestHandler } from 'express';
import { startConnection } from './database';
import { setupSwagger } from './swagger'; 
import corsOptions from './middlewares/cors';
import userRoutes from './routes/user.routes'; 
import packetRoutes from './routes/packet.routes';
import authRoutes from './routes/auth.routes';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno desde el archivo .env

import './utils/passport.google'; // Ensure the Google strategy is registered

const app: express.Application = express();

app.set('port', process.env.PORT || 4000);

app.use(corsOptions);
app.use(express.json() as RequestHandler);

startConnection();

setupSwagger(app);

app.use('/api/users', userRoutes);
app.use('/api/packets', packetRoutes);
app.use('/api/auth', authRoutes);

app.use(passport.initialize());

app.listen(app.get('port'), () => {
    console.log(`Server running on port ${app.get('port')}`);
    console.log(`Swagger disponible a http://localhost:${app.get('port')}/api-docs`);
});

export default app;