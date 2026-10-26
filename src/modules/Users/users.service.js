import { userModel } from "../../DB/models/users.model.js";
import { errorRes } from "../../utils/error.handle.js";
import jwt from "jsonwebtoken"
import { createHash,compareHash } from "../../utils/security/hash.js";
import { decodeToken, tokenEnum } from "../../middlewares/auth.middleware.js";
import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "./users.types.js";
import { sendEmail } from "../../utils/email/sendEmail.js";
import {emailTemplate} from "../../utils/email/emailTemplate.js"
import { random } from "../../utils/email/createOtp.js";
import { redisClient } from "../../DB/redis.connect.js";
import { attemptsBlockCountKey, attemptsBlockKey, attemptsKey, confirmEmailKey, resendOtpKey, userPrefixKey } from "../../utils/redis.services.js";
const googleClient = new OAuth2Client()

const calcBlockSecs =(count)=>
{

    const Block_Mins_Array = [5,15,60,300,1440]
    const index = Math.min(count,Block_Mins_Array)
    return Block_Mins_Array[index-1]

}

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
            
        }
    )
    const rediskey=confirmEmailKey(user._id)

    await redisClient.set(rediskey,await createHash(otp),{
        expiration:{
            type:"EX",
            value: 5 * 60
        }
    })
    await redisClient.set(resendOtpKey(user._id),0,{
        expiration:{
            type:"EX",
            value:60
        }
    })

    await redisClient.incr(attemptsKey(user._id))
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

export const confirmEmail = async (email, otp) => {
    if (!email || !otp) {
        errorRes({
            msg: "email and otp are required",
            statusCode: 400
        })
    }
    const user = await userModel.findOne({
        email,
        confirmedAt: {
            $exists: false
        }
    })
    
    if (!user) {
        errorRes({
            msg: "user not found or already confirmed",
            statusCode: 404,
        })
    }

    
    const hashedOtp = await redisClient.get(confirmEmailKey(user._id))
    
    if(!otp)
    {
        errorRes({
            msg : "invalid or expired otp"
        })
    }

    const isBlocked= await redisClient.get(attemptsBlockKey(user._id))

    if(isBlocked)
    {
        const blockedTTL =await redisClient.ttl(attemptsBlockKey(user._id))
        errorRes({
            msg:`try again after ${Math.ceil(ttl/60)} M`
        , statusCode:400
        })
    }   

    
    const isOtpCorrect = await compareHash(otp,hashedOtp)


    if(!isOtpCorrect)
    {
    
    const attempts = await redisClient.incr(attemptsKey(user._id))
    if(attempts>=5)
    {
        const blockCount=await redisClient.incr(attemptsBlockCountKey(user._id))
        await redisClient.set(attemptsBlockKey(user._id),0,{
    
        expiration:{
                type:"EX",
                value:calcBlockSecs(blockCount)
            }}
    )
    errorRes({
        msg:`try again after ${Math.ceil(ttl/60)} M` 
    , statusCode:400
    })

    }
    }

    else{
        user.confirmedAt=Date.now()
        await user.save()
        const userkeys=await redisClient.keys(`${userPrefixKey(user._id)}*`)
        await redisClient.del(userkeys)
    }


    user.confirmedAt = new Date()

    user.otp = undefined

    await user.save()

    return {
        data: {}
    }
}

export const forgetPassSendOtp = async (email) => {
    if (!email) {
        errorRes({
            msg: "email is required",
            statusCode: 400
        })
    }
    const user = await userModel.findOne({ email })

    if (!user) {
        return
    }

    if (user.otp?.expireIn > Date.now()) {
        return
    }

    const otp = random(6)

    user.otp = {
        code:await createHash(otp),
        expireIn: new Date(Date.now() + 5 * 60 * 1000)
    }
    await user.save()

    await sendEmail({
        to: email,
        subject: "forget password",
        html: emailTemplate({
            otp,
            subject: "forget password"
        })
    })

    return {
        data: {}
    }
}


export const resetPassword=async(email,otp,password)=>
{
    const user = await userModel.findOne({email})
    if(!user)
    {
        errorRes({
            msg:"user not found",
            statusCode:404
        })
    }
    await checkOtp(user,otp)
    user.password = await createHash(password)
    await user.save()
    return {
        data:{

        }
    }
}   

// export const checkOtp=async(user,otp)=>
// {

//     if (!user.otp || user.otp.expireIn < Date.now()) {
//         errorRes({
//             msg: "otp expired",
//             statusCode: 404
//         })
//     }
//     const isMatch = (user.otp.code === String(otp)) || (await compareHash(String(otp), user.otp.code).catch(() => false))
//     if (!isMatch) {
//         errorRes({
//             msg: "in-valid otp",
//             statusCode: 400
//         })
//     }
// }

