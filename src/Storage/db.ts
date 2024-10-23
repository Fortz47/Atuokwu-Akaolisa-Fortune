import mongoose from "mongoose";
import { connect } from "mongoose";


class DB {
  private static isConnected: boolean = false;

  static async connectDB(uri: string) {
    try {
      this.dbConnectionListener();
      await connect(uri);
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
  
  static dbConnectionListener() {
    // Listen for connection events
    const db = mongoose.connection;
    db.on('connected', () => {
      console.log(`Mongoose connected to the database: ${db.host}/${db.name}`);
      DB.isConnected = true;
    });
  
    db.on('error', (err) => {
      console.error(`${db.host}/${db.name}: Mongoose connection error: ${err}`);
      this.isConnected = false;
    });
  
    db.on('disconnected', () => {
      console.log(`Mongoose disconnected from database: ${db.host}/${db.name}`);
      this.isConnected = false;
    });
  }

  static IS_CONNECTED() {
    return this.isConnected;
  }
}



export default DB;