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
  const pool = new Pool(config);

  //  const probarConexion = async () => {
  //   const consulta = "SELECT NOW()";
  //   const resultado = await pool.query(consulta);
  //   return resultado.rows[0].now;
  // };
  
  // probarConexion(); 



  export const getUsers = async()=>{
    const consulta = "SELECT * FROM usuarios order by id";
    const resultado = await pool.query(consulta);
    return resultado.rows;
  }

  export const addUser = async(datos)=>{
    const consulta = "INSERT INTO usuarios (nombre,balance) values($1, $2) RETURNING *";
    const resultado = await pool.query(consulta, datos);
    return resultado.rows;
  }

  export const updateUser = async(datos)=>{
    const consulta = "UPDATE usuarios set nombre=$1, balance=$2 WHERE id=$3 RETURNING *"
    const resultado = await pool.query(consulta,datos)
    return resultado.rows
  }
  
  export const deleteUser = async(id)=>{
    const consulta = "DELETE FROM usuarios WHERE id = $1 RETURNING *";
    const resultado = await pool.query(consulta,[id])
    return resultado.rows;
  }