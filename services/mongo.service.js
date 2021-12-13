import MongoConfigs from '../config/database/mongodb';
import mongoose from "mongoose";

class MongoService {

    #connectionStr = `mongodb://${MongoConfigs.userName}:${MongoConfigs.password}@${MongoConfigs.host}:${MongoConfigs.port}/${MongoConfigs.dbName}`;

    /**
     * Initialize mongodb connection
     */
    async connect() {
        mongoose.Promise = global.Promise;
        await mongoose.connect(this.#connectionStr, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        }).then(() => {
                console.log('Database connected')
            },
            error => {
                console.log('Database could not be connected : ' + error)
            });
    }

    async close() {
        console.log('Closing database...');

        await mongoose.connection.close().catch(error => {
            console.log('Error while closing the database', error);
            process.exit(1)
        })

        console.log('Database closed');
    }

}

export default MongoService;