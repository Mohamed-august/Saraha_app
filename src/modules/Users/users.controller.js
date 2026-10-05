import { Router } from "express";
import { signupService , loginService} from "./users.service.js";
import { successRes } from "../../utils/success.res.js";
import { auth } from "../../middlewares/auth.middleware.js";
const userRouter = Router()

export const routes = {
    base:"/users",
    signup:"/signup", //POST
    login:"/login", //POST
    me:"/me", //GET
    refreshToken:"/refresh-Token", //GET
}

userRouter.post(routes.signup,async(req,res)=>
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


userRouter.get(routes.me,auth,async(req,res)=>
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
    const {data}=await decodeToken({authorization})
    return successRes({
        res,
        status:200
    },data)
})
export default userRouter
