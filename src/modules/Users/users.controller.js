import { Router } from "express";
import { signupService , loginService, refreshToken, confirmEmail} from "./users.service.js";
import { successRes } from "../../utils/success.res.js";
import { auth, authorization } from "../../middlewares/auth.middleware.js";
import { signupSchema } from "./user.validation.js";
import {validation} from "../../middlewares/validation.middleware.js"
import { RoleEnum } from "./users.types.js";
import { googleLogin } from "./users.service.js";
const userRouter = Router()

export const routes = {
    base:"/users",
    signup:"/signup", //POST
    login:"/login", //POST
    me:"/me", //GET
    refreshToken:"/refresh-Token", //POST
    googleSignup:"/signup/gmail", //POST
    confirmEmail:"/confirm-email", //PATCH
}

userRouter.post(routes.signup,validation(signupSchema),async(req,res)=>
    {
        const {data} = await signupService(req.body)
        return successRes({
            res,
            status:201},
            data)
    })

userRouter.post(routes.login,async(req,res)=>
{
    const {identifier,password} = req.body
    const {data} = await loginService({identifier,password})
    return successRes({
        res,
        status:200
    },data)
})


userRouter.get(routes.me,auth,authorization(RoleEnum.user),async(req,res)=>
{
    const user = req.user
    successRes({
        res,
        status:200
    },{data:user})
}
)

userRouter.post(routes.refreshToken,async(req,res)=>
{
    const authorization=req.headers.authorization
    const {data}=await refreshToken({authorization})
    return successRes({
        res,
        data
    })
})

userRouter.post(routes.googleSignup,async(req,res)=>{
    const {data}=await googleLogin(req.body.idToken)
    successRes({res,data})
})

userRouter.patch(routes.confirmEmail,async(req,res)=>
{
    const {email,otp}=req.body
    const {data}= await confirmEmail(email,otp)
    successRes({res,data})
})
export default userRouter
