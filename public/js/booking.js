import axios from "axios";
import { showAlert } from "./alerts";
import BACKEND_URL from "./utils"

export const bookTour=async (user,price,tour,tourist,age)=>{
    try{
        const res=await axios({
            method: "post",
            url:`${BACKEND_URL}api/v1/bookings`,
            data: {
                tour,
                user,
                price,
                tourist,
                age
            }
        })
        showAlert("success","Your booking has been confirmed. Kindly check it in 'My Bookings' Section");
    } catch( err){
        showAlert("error",err.response.data.message);
    }
}