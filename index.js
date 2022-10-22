import http from 'http';
import fs from 'fs'
import url from 'url'
import { getUsers,addUser,updateUser,deleteUser } from './utils/DbConnection.js'
import { getTransferencia, addTransferencia } from './utils/transferenciasQuerys.js'
import moment from 'moment/moment.js';

const port = 3000;
http.createServer(async(req,res)=>{
    if (req.url == "/" && req.method == "GET") {
        res.setHeader("content-type", "text/html");
        res.statusCode = 200;
        const html = fs.readFileSync("./public/index.html", "utf8");
        res.end(html);
    } else if (req.url == "/usuarios" && req.method == "GET") {
        let resultado = await getUsers();
        //console.log(resultado);
        res.end(JSON.stringify(resultado));
        
      } else if (req.url == '/usuario' && req.method == "POST"){
        let body = '';
        req.on('data',(chunk)=>{
            body += chunk;
        })
        req.on('end',async()=>{
            try {
                const datos = Object.values(JSON.parse(body));
                const respuesta = await addUser(datos);
                res.statusCode = 201;
                res.end(JSON.stringify(respuesta));      
            } catch (error) {
                res.end(
                    JSON.stringify({
                        code:error.code,
                        message:'Por favor informar al admin'
                    })
                )
            }
        })
    } else if(req.url.startsWith('/usuario?id=') && req.method == "PUT"){
        let body='';
        req.on('data',(chunk)=>{
            body += chunk;
        });
        req.on('end',async()=>{
            try {
                const datos = Object.values(JSON.parse(body));
                const respuesta = await updateUser(datos);
                res.statusCode=201;
                res.end(JSON).stringify(respuesta)
            } catch (error) {
                res.end(JSON.stringify({
                    code:error.code,
                    message:'no se pudo'
                }))
                console.log(`${error}`)
            }
        })
    } else if(req.url.startsWith('/usuario?id=') && req.method == "DELETE"){
        try {
            const {id}=url.parse(req.url,true).query;
            const respuesta = await deleteUser(id);
            res.statusCode=200;
            res.end(JSON.stringify(respuesta))
        } catch (error) {
            res.end(JSON.stringify({
                code:error.code,
                message:'no se pudo'
            }))
        }
    } else if (req.url == "/transferencias" && req.method == "GET") {
      let resultado = await getTransferencia();
      //console.log(resultado);
      res.end(JSON.stringify(resultado));
    } else if (req.url == '/transferencia' && req.method == "POST"){
      let body = '';
      let fecha = {fecha:moment().format('DD-MM-YYYY')}
      req.on('data',(chunk)=>{
          body += chunk;
        })
        req.on('end',async()=>{
            try {
              let cuerpo = Object.assign(body,fecha)
              const datos = Object.values(JSON.parse(cuerpo));
              const respuesta = await addTransferencia(datos);
              res.statusCode = 201;
              res.end(JSON.stringify(respuesta));      
          } catch (error) {
              res.end(
                  JSON.stringify({
                      code:error.code,
                      message:'Por favor informar al admin'
                  })
              )
          }
      })
  }    
    
})
.listen(port,()=>console.log(`servidor corriendo en http://localhost:${port}`))