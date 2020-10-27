import axios from "axios";
import { showAlert } from "./alerts";
import BACKEND_URL from "./utils"
export const resetuserPassword=async (token,password,confirmPassword)=>{
    try{    
        const res=await axios({
            method: "PATCH",
            url: `${BACKEND_URL}api/v1/users/resetPassword/${token}`,
            data:{
                password,
                confirmPassword
            }
        })
        showAlert("success","Password has changed successfully");
    } catch(err){
        showAlert("error",err.response.data.message);
    }
}