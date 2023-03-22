import express from "express";
import { router as routerBuild } from "./routes/build";
import { ENV } from "./env";
const app=express();
app.use(express.static(ENV.public.path));
app.use("/build",routerBuild);
app.listen(ENV.port,()=>{
    console.log("Start server on port: "+ENV.port);
    console.log("Server path: "+process.cwd());
    console.log("Gatsby path: "+ENV.gatsby.path);
    console.log("Public path: "+ENV.public.path);
});
