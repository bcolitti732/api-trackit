import { connect, connection } from 'mongoose'

const mongoURI = 'mongodb://localhost:27017/trackit-DB';  

export async function startConnection() {
    try {
        await connect(mongoURI, {
        });
        console.log('Connected to MongoDB successfully!');
    } catch (err) {
        console.error('Unable to connect to MongoDB. Error:', err);
    }
}
