import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectToDatabase } from "./db/connection.js";


//connections and listeners

connectToDatabase().then(()=>{
   app.listen(process.env.PORT, ()=>console.log("Server is running on port " + process.env.PORT + " and connected to database"));
}).catch((error)=>console.log(error));

