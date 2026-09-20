import mongoose from 'mongoose';


const  dbConnect =async ()=>{
    try {
      await mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log("Connected to DB successfully");  
    } catch (error) {
      console.log("unable to connect DB ", error) ;
    }
  }
export  default dbConnect ;