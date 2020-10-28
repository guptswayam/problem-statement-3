import "@babel/polyfill";
import { login, logout, signup } from "./login";
import { displaymap } from "./mapbox";
import * as settings from "./updateSettings";
import { resetuserPassword } from "./resetPassword";
import { bookTour } from "./booking";
import { submitReview } from "./review";

const loginForm = document.querySelector(".login-form");
const signupForm = document.querySelector(".signup-form");
const mapBox = document.getElementById("map");
const logOut= document.querySelector(".log___out");
const userFormData= document.querySelector(".form-user-data");
const userFormPassword= document.querySelector(".form-user-password");
const resetPassword= document.querySelector(".form-user-reset-password");
const bookTourForm= document.querySelector(".form-book-tour");
const reviewForm= document.querySelector(".review-form");
const searchForm = document.getElementById("search__form");

if(searchForm){
    searchForm.addEventListener("submit",(e)=>{
        e.preventDefault();
        location.assign(`/?startCity=${document.getElementById("start__city").value}`)
    })
}

if(logOut){
    logOut.addEventListener("click",logout);
}

if (mapBox) {
    const locations = JSON.parse(document.getElementById("map").dataset.locations);
    displaymap(locations);
}

if (loginForm)
    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const email = document.querySelector("#email").value;
        const pass = document.querySelector("#password").value;
        login(email, pass);
    })
if(signupForm)
    signupForm.addEventListener("submit",async e=>{
        e.preventDefault();
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;
        const name= document.querySelector("#name").value;
        const confirmPassword= document.querySelector("#confirm-password").value;
        document.getElementById("btn-signup").textContent="Signing Up...";
        await signup({email,name,password,confirmPassword});
        document.getElementById("btn-signup").textContent="Sign Up";
    });

if(userFormData)
    userFormData.addEventListener("submit",e=>{
        e.preventDefault();
        //To send an image to the server using form, we have to use FormData Class. This type of form is known as multi-part form, which is used to send files to the server.
        const form=new FormData();
        form.append("name",document.getElementById("name").value);
        form.append("email",document.getElementById("email").value);
        form.append("photo",document.getElementById("photo").files[0]);
        settings.updateData(form);
    })

if(userFormPassword)
    userFormPassword.addEventListener("submit",async e=>{
        e.preventDefault();
        const currentPassword=document.getElementById("password-current").value;
        const password=document.getElementById("password").value;
        const confirmPassword= document.getElementById("password-confirm").value;
        const btn=document.querySelector(".update-password");
        btn.textContent="saving password...";
        await settings.updatePassword(currentPassword,password,confirmPassword);
        btn.textContent="save password";
        document.getElementById("password").value="";
        document.getElementById("password-current").value="";
        document.getElementById("password-confirm").value="";
    });

if(resetPassword)
    resetPassword.addEventListener("submit",e=>{
        e.preventDefault();
        const token=resetPassword.dataset.token;
        const password=document.getElementById("password").value;
        const confirmPassword= document.getElementById("password-confirm").value;
        resetuserPassword(token,password,confirmPassword);
    })

if(bookTourForm)
    bookTourForm.addEventListener("submit",async e=>{
        e.preventDefault();
        const user=bookTourForm.dataset.user;
        const price=bookTourForm.dataset.price;
        const tour=bookTourForm.dataset.tour;
        const tourist=document.getElementById("tourist").value;
        const age= document.getElementById("age").value;
        document.querySelector(".pay-now").textContent="Paying...";
        await bookTour(user,price,tour,tourist,age);
        document.querySelector(".pay-now").textContent="Pay now";
        document.getElementById("tourist").value="";
        document.getElementById("age").value="";
    })

    if(reviewForm)
        reviewForm.addEventListener("submit",e=>{
            e.preventDefault();
            const user=reviewForm.dataset.user;
            const tour=reviewForm.dataset.tour;
            const review=reviewForm.dataset.review;
            const desc=document.getElementById("desc").value;
            const rating= document.getElementById("rating").value;
            submitReview({user,tour,review,desc,rating});
        })