import { Router } from "express";
export const router=Router();
import { ENV } from "../env";
import {exec} from "child_process";
import fs from "fs";
import path from "path";
const VERBOSE=ENV.verbose;
const DEBUG=ENV.debug;
router.post("/build",(req:any,res:any)=>{
   try{
      if(!req.headers.authorization)
         return res.status(401).send("Need Auth");   
      const auth = Buffer.from(req.headers.authorization.split(' ')[1],'base64').toString().split(":");
      if(auth.length<2)
         return res.status(401).send("Invalid Auth");
      const user=auth[0];
      const pass=auth[1];   
      if(user!==ENV.build.auth.user||pass!==ENV.build.auth.pass)
         return res.status(403).send("Invalid Auth Key");
      if(VERBOSE)
        console.log("Run gatsby build Command: "+`cd ${ENV.gatsby.path};npm run build`);   
      exec(`cd ${ENV.gatsby.path};npm run build`,(error:any,stdout:string,stderr:string)=>{
          if(error){
            return res.status(500).send(stderr);
          }   
          if(VERBOSE){
            console.log("GATSBY BUILD OK");
          }  
          try{
             fs.writeFileSync(getBuildResultsPath(true),stdout)
          }catch(e){
              if(VERBOSE){
                console.log("Write buildresult error");
                if(DEBUG)
                  console.log(e);
              }  
          }
          copyGatsbyBuildPath();
      });
   }catch(e){
      try{
         fs.writeFileSync(getBuildResultsPath(false),JSON.stringify(e));
      }catch(e){

      }
      return res.status(500).send("I-E");
   }
   async function copyGatsbyBuildPath(){
      try{
         await deletePath(ENV.public.path+"_temp");
         await copyGatsbyPathToTempPublic();
         await deletePath(ENV.public.path);
         await moveTempPublicToPublic();
         return res.send("OK");
      }catch(e){
         if(VERBOSE)
            console.log(e);
         return res.status(500).send("I-E");
      }

      async function deletePath(path:string){
         if(!fs.existsSync(path))
           return;
         return new Promise((resolve:any,reject:any)=>{
              if(VERBOSE)
                console.log("Delete Public Path "+`rm -r ${path}`);
              exec(`rm -r ${path}`,(error:any,stdout:string,stderr:string)=>{
                   return resolve(error,stderr,stdout); 
              })
         });
     }   
     async function copyGatsbyPathToTempPublic(){
      return new Promise((resolve:any,reject:any)=>{
         if(VERBOSE)
           console.log("Copy Gatsby Build Path "+`cp -R ${ENV.gatsby.path}/public ${ENV.public.path}_temp`);
         exec(`cp -R ${ENV.gatsby.path}/public ${ENV.public.path}_temp`,(error:any,stdout:string,stderr:string)=>{
              if(error)
                return reject({error,stderr});
              return resolve(stdout); 
         })
     });
     }
     async function moveTempPublicToPublic(){
      return new Promise((resolve:any,reject:any)=>{
         if(VERBOSE)
         console.log("Move TempPublicPath to PublicPath "+`mv ${ENV.public.path}_temp ${ENV.public.path}`);
         exec(`mv ${ENV.public.path}_temp ${ENV.public.path}`,(error:any,stdout:string,stderr:string)=>{
              if(error)
                return reject({error,stderr});
              return resolve(stdout); 
         })
       });     
     }

   }
});

function getBuildResultsPath(isOk:boolean){
   return path.join("buildresults",(new Date()).getTime().toString()+(isOk?"_ok":"_error"));
}