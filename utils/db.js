import { MongoClient } from 'mongodb';
import Collection from 'mongodb/lib/collection';

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || '27017';
        const database = process.env.DB_DATABASE || 'files_manager';
        const uri = `mongodb://${host}:${port}/${database}`;
        this.client = new MongoClient(uri, { useUnifiedTopology: true });
        this.client.connect()
    }

    isAlive() {
        return this.client.isConnected();
    }

    async nbUsers() {
        const db = this.client.db();
        return await db.collection('users').countDocuments();
    }

    async nbFiles() {
        const db = this.client.db();
        return await db.collection('files').countDocuments();
    }
}

const dbClient = new DBClient();
export default dbClient;
