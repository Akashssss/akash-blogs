import jwt from 'jsonwebtoken';



export default function formatDataToSend(user){
   const  access_token  = jwt.sign({id :user._id} , process.env.SECRET_ACCESS_KEY)
    return {
             access_token,
            profile_img :user.personal_info.profile_img,
            username : user.personal_info.username ,
            fullname : user.personal_info.fullname 
    }
    
}