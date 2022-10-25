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

export const getTransferencia = async () => {
    const consulta = `select t1.id, t1.monto, t1.fecha, u1.nombre emisor, recep.receptor receptor from transferencias t1 join usuarios u1
    on t1.emisor = u1.id
    inner join
    (select t2.id, u2.nombre receptor from transferencias t2 join usuarios u2
    on t2.receptor = u2.id) recep
    on t1.id = recep.id order by t1.id`;
    const resultado = await pool.query(consulta);
    return resultado.rows;
  };
  
  export const addTransferencia= async (datos) => {
    //console.log(datos)
    const consulta =
      "insert into transferencias (emisor,receptor,monto,fecha) values($1, $2, $3, now()) RETURNING *";
    const resultado = await pool.query(consulta, datos);  
    return resultado.rows;
  };


  
//AQUI QUEDAMOS EL SABADO!!
  export const transferir = async (emisor, receptor, monto) => {
    const client = await pool.connect();
    if (monto < 0) {
      console.log("Error, el monto a transferir debe ser mayor que 0");
      pool.end();
    }
    // else if(emisor===receptor){
    //   console.log('no te puedes transferir a ti mismo');
    //   pool.end();
    // } 
    else {
      try {
        await client.query("BEGIN");
        //DESCONTAR SALDO
        const descontarSaldo = {
          text: `UPDATE usuarios SET balance = balance - $1 WHERE id = $2`,
          values: [monto, emisor],
        };
        await client.query(descontarSaldo);
  
        //SUMAR SALDO
        const sumarSaldo = {
          text: `UPDATE usuarios SET balance = balance + $1 WHERE id = $2`,
          values: [monto, receptor],
        };     

        await client.query(sumarSaldo);
  
        await client.query("COMMIT");
        console.log(
          `Transacción OK: Se han transferido ${monto} bitcoin desde la cuenta ${emisor} a la cuenta ${receptor}'`
        );
      } catch (e) {
        await client.query("ROLLBACK");
        console.log("Transacción Fallida: " + e);
      } 
    }
  };
