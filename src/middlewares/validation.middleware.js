import { errorRes } from "../utils/error.handle.js"

export const validation = (schema)=>
{
    return (req,res,next)=>
    {
        const validationErrors=[]
        const validationRes=schema.safeParse(req.body)
                Object.keys(schema).map(ele=>
        {
            schema[ele].safeParse(req[ele])
        }
        )
                if(!validationRes.success)
                {
                    validationErrors.push({[ele]:validation.error.issues})
                    if(validationErrors.length)
                    {
                        errorRes({
                        msg:"validation error",
                        statusCode:400,
                        options:validationErrors})
                    }
                    }
                    next()
                    }
                    }
