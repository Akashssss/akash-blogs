import User from "../Schema/User.js";
import { nanoid } from "nanoid";



export default async function generateUsername(email){
    let username = email.split('@')[0];

// i know its a bad  stuff to run a loop until the confirmation
    while(await  User.exists({"personal_info.username" : username})){
       username = `${username}${nanoid(5)}`;
    }
    return username;
}