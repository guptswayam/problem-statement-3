import { showAlert } from "./alerts"
import axios from "axios";
import BACKEND_URL from "./utils"

export const submitReview=async data=>{
    try{
        const url= `${BACKEND_URL}api/v1/reviews${data.review?"/"+data.review:""}`;
        const res=await axios({
            method: `${data.review?"PATCH":"POST"}`,
            url,
            data:{
                review:data.desc,
                rating: data.rating,
                user: data.user,
                tour: data.tour
            }
        })
        showAlert("success","Thank you for reviewing the Tour");
        window.setTimeout(()=>{
            location.assign("/");
        },2000);
    } catch(err){
        showAlert("error",err.response.data.message);
    }
}