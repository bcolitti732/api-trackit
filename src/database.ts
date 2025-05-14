import { connect, connection } from 'mongoose'

const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb:27017/trackit'; 

export async function startConnection() {
    try {
        await connect(mongoURI, {
        });
        console.log('Connected to MongoDB successfully!');
    } catch (err) {
        console.error('Unable to connect to MongoDB. Error:', err);
    }
}
