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
    const consulta = "SELECT * FROM transferencias order by id";
    const resultado = await pool.query(consulta);
    return resultado.rows;
  };
  
  export const addTransferencia= async (datos) => {
    const consulta =
      "insert into transferencias (emisor,receptor,monto,fecha) values($1, $2, $3, $4) RETURNING *";
    const resultado = await pool.query(consulta, datos);  
    return resultado.rows;
  };


  
//AQUI QUEDAMOS EL SABADO!!
  export const transferir = async (emisor, receptor, monto) => {
    const client = await pool.connect();
    if (monto < 0) {
      console.log("Error, el monto a transferir debe ser mayor que 0");
      pool.end();
    }else if(emisor==receptor){
      console.log('no te puedes transferir a ti mismo');
      pool.end();
    } 
    else {
      try {
        await client.query("BEGIN");
        //DESCONTAR SALDO
        const descontarSaldo = {
          text: `UPDATE usuarios SET balance = balance - $1 WHERE id = $2`,
          values: [balance, id],
        };
        await client.query(descontarSaldo);
  
        //SUMAR SALDO
        const sumarSaldo = {
          text: `UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2`,
          values: [monto, destino],
        };
        //Registrar transaccion
        const fecha = moment().format("DD-MM-YYYY");
        const registrarTransaccion = {
          text: `INSERT INTO transacciones VALUES (default,$1,'${fecha}',$2,$3) RETURNING *`,
          values: [mensaje, monto, origen],
        };
  
        const ultimaTransaccion = await client.query(registrarTransaccion);
        console.log(ultimaTransaccion.rows[0]);
        await client.query(sumarSaldo);
  
        await client.query("COMMIT");
        console.log(
          `Transacción OK: hoy ${fecha}, se han transferido ${monto} bitcoin desde la cuenta ${origen} a la cuenta ${destino} con el siguiente mensaje '${mensaje}'`
        );
      } catch (e) {
        await client.query("ROLLBACK");
        console.log("Transacción Fallida: " + e);
      } finally {
        pool.end();
      }
    }
  };
