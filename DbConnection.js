import pg from 'pg';
import dotenv from 'dotenv'
const { Pool } = pg;
dotenv.config()

const config = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.PORT_DB,
    database: process.env.DATABASE,
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 0,
  };

console.log(process.env)