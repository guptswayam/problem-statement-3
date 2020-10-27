import axios from "axios"
import { showAlert } from "./alerts";
import BACKEND_URL from "./utils"

export const login = async (email, pass) => {
    try {
        const res = await axios({
            method: "post",
            url: `${BACKEND_URL}api/v1/users/login`,
            data: { email, password: pass }
        })
        showAlert("success","Succesfully Logged In");
        window.setTimeout(()=>{
            location.assign("/")
        },1000);
    } catch (err) {
        console.log(err)
        showAlert("error",err);
    }
}

export const logout=async ()=>{
    try{
        const res=await axios.get(`${BACKEND_URL}api/v1/users/logout`);
        if(res.data.status=="success")
            location.reload(true);
    }
    catch(err){
        alert("error","error logging out try again later...");
    }
}

export const signup=async data=>{
    try{
        const res = await axios({
            method: "post",
            url: `${BACKEND_URL}api/v1/users/signup`,
            data
        })
        showAlert("success","Succesfully Signed Up");
        window.setTimeout(()=>{
            location.assign("/")
        },1000);
    } catch(err){
        showAlert("error",err.response.data.message);
    }
}