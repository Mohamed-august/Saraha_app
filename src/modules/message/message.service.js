import { messageModel } from "../../DB/models/message.model.js"
import { userModel } from "../../DB/models/users.model.js"
import { errorRes } from "../../utils/error.handle.js"

export const sendMessage = async(content, images, to) => {
    const user = await userModel.findById(to)
    if(!user) {
        errorRes({
            msg:"User not found",
            statusCode:404,
        })
    }
    const message =await messageModel.create({
        content,
        images,
        to
    })

    return {
        data:{
            message
        }
    }
}