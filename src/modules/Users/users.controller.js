import { Router } from "express";
import { signupService, loginService, refreshToken, confirmEmail, forgetPassSendOtp } from "./users.service.js";
import { successRes } from "../../utils/success.res.js";
import { auth, authorization } from "../../middlewares/auth.middleware.js";
import { resetPasswordSchema, signupSchema } from "./user.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { RoleEnum } from "./users.types.js";
import { googleLogin } from "./users.service.js";
import { resetPassword } from "./users.service.js";
import { uploadFile } from "../../utils/multer.js";
const userRouter = Router()

export const routes = {
    base: "/users",
    signup: "/signup", //POST
    login: "/login", //POST
    me: "/me", //GET
    refreshToken: "/refresh-Token", //POST
    googleSignup: "/signup/gmail", //POST
    confirmEmail: "/confirm-email", //PATCH
    forgetPass: "/forget-password", //PATCH
    resetPassword:"/reset-password", //PATCH
    uploadFile:"/upload-file", //GET
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

userRouter.patch(routes.confirmEmail, async (req, res) => {
    const { email, otp } = req.body
    const { data } = await confirmEmail(email, otp)
    return successRes({ res, data })
})

userRouter.patch(routes.forgetPass, async (req, res) => {
    const { email } = req.body
    await forgetPassSendOtp(email)
    return successRes({
        res
        ,msg:"otp send to email if exist"
        })
})

userRouter.patch(routes.resetPassword,validation(resetPasswordSchema),async(req,res)=>{
    const {email,otp,password} = req.body
    await resetPassword(email,otp,password)

    successRes({
        res
    })
})

userRouter.post(routes.uploadFile,auth,uploadFile("users").single("image"),async(req,res)=>{
    console.log({
        body:req.body,
        file:req.file
    })

    req.user.profileImage=req.file.path

    await req.user.save()

    successRes({res})
})

export default userRouter
