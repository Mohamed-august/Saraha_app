import { userModel } from "../../DB/models/users.model.js";
import { errorRes } from "../../utils/error.handle.js";
import jwt from "jsonwebtoken"
import { createHash,compareHash } from "../../utils/security/hash.js";
import { decodeToken, tokenEnum } from "../../middlewares/auth.middleware.js";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "./users.types.js";
import { successRes } from "../../utils/success.res.js";
import { sendEmail } from "../../utils/email/sendEmail.js";
import {emailTemplate} from "../../utils/email/emailTemplate.js"
import { random } from "../../utils/email/createOtp.js";
const googleClient = new OAuth2Client()

export const signupService = async({fullname,email,password,gender,phone,bio,age,userName})=>
{

    const {isEmailExist,isUserNameExist} = await Promise.all(
        [
            userModel.findOne({email}),
            userModel.findOne({userName})
        ]
    )
    if(isEmailExist || isUserNameExist){
        errorRes({msg:`${isEmailExist?"email":"username"}  already exists`,
            statusCode:400})
    }

    const otp=random(6)
    await sendEmail({
        to:email,
        subject:"confirm email",
        html:emailTemplate({otp,subject:"confirm email"})
    })

    const user = await userModel.create(
        {
            fullname,
            email,
            password:await createHash(password),
            gender,
            phone,
            bio,
            age,
            userName,
            otp:
            {
                otp
            }
        }
    )
    return {data:user}
}

export const loginService = async({identifier,password})=>
{
    const user = await userModel.findOne({$or:[
        {email:identifier},
        {userName:identifier}]})
    if(!user){
        errorRes({msg:"invalid credentails",
            statusCode:400})
    }
    const isMatch = await compareHash(password, user.password);
    if (!isMatch) {
        errorRes({ msg: "invalid credentials", statusCode: 400 });
    }
    const accessToken =jwt.sign({
        _id:user._id,
        email:user.email
    },process.env.ACCESS_TOKEN_SECRET,{expiresIn:"30M"})

    const refreshToken = jwt.sign({
        _id:user._id,
        email:user.email
    },process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"})

    return {data:{accessToken,refreshToken}}
}

export const refreshToken=async({authorization})=>
{
    const {user} = await decodeToken({authorization,tokenType:tokenEnum.refresh})
    const accessToken = jwt.sign({_id:user._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"30M"})
    return {data:{accessToken}}
}


export const googleLogin =async(token)=>
{
    const ticket = await googleClient.verifyIdToken({
        idToken:token,
        audience:process.env.CLIENT_ID
    })

    const userData= ticket.getPayload()
    console.log({userData})

    const user = await userModel.findOne({email})
    if(user.provider!==ProviderEnum.google)
    {
        errorRes({msg:`use your provider`})
    }

    else{
        user=await userModel.create({
            email,
            fullname:name,
            profileImage:image
    })
    }

    const accessToken =jwt.sign({
        _id:user._id,
        email:user.email
    },process.env.ACCESS_TOKEN_SECRET,{expiresIn:"30M"})

    const refreshToken = jwt.sign({
        _id:user._id,
        email:user.email
    },process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"})

    return {
        data:{
            accessToken,
            refreshToken
        }
        }
    }

export const confirmEmail = async (email,otp)=>
{
    const user = await userModel.findOne({email,confirmedAt:
        {
            $exists:false
        }
    })
    if(!user)
    {
        errorRes({
            msg:"user not found",
            statusCode:404,
        })
    }
    if(!user.otp || user.otp.expireIn<Date.now())
    {
        errorRes({
            msg:"otp expired",
            statusCode:404
        })
    }
    if(user.otp.otp!==otp)
    {
        errorRes({
            msg:"in-valid otp",
            statusCode:404
        })
    }
    user.confirmedAt = Date.now()
    await user.save()
    return {
        data:
        {

        }}
    }

