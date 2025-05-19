import { connect, connection } from 'mongoose'

console.log('MONGO_URI:', process.env.MONGO_URI);
const mongoURI = process.env.MONGO_URI || 'mongodb://192.168.10.71:27017/trackit-DB';

export async function startConnection() {
    try {
        await connect(mongoURI, {
        });
        console.log('Connected to MongoDB successfully!');
    } catch (err) {
        console.error('Unable to connect to MongoDB. Error:', err);
    }
}
