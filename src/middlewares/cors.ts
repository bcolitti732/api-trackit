import cors from 'cors';

const corsOptions = {
    origin: [
        'http://localhost:4005',
        'http://localhost:4001',
        'http://localhost:4000',
        'http://localhost:3000',
        'http://localhost:4200',
        'http://192.168.10.71:4001',
        'http://192.168.10.71:4000',
        'http://192.168.10.71:4005',
        'http://192.168.10.71:4002',
        'http://ea4-api.upc.edu',
        'http://ea4-api.upc.edu:4000',
        'http://ea4-api.upc.edu:4005',
        'http://ea4.upc.edu',
        'http://ea4-back.upc.edu'

    ],
    credentials: true,
    optionsSuccessStatus: 200,
};

export default cors(corsOptions);