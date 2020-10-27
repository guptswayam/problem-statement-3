import { showAlert } from "./alerts";
import axios from "axios";
import BACKEND_URL from "./utils"

export const updateData=async data=>{
    try{
        const res=await axios({
            method:"patch",
            url:`${BACKEND_URL}api/v1/users/updateProfile`,
            data
        })
        if(res.data.status=="success")
            showAlert("success","Data updated succesfully");
    } catch(err){
        showAlert("error",err.response.data.message);
    }
}
export const updatePassword=async (currentPassword, password, confirmPassword)=>{
    try{
        const res=await axios({
            method:"patch",
            url:`${BACKEND_URL}api/v1/users/updatePassword`,
            data:{
                currentPassword,
                password,
                confirmPassword
            }
        })
        if(res.data.status=="success")
            showAlert("success","Password updated succesfully");
    } catch(err){
        showAlert("error",err.response.data.message);
    }
}