import { model , Schema } from "mongoose"
import { GenderEnum , ProviderEnum , RoleEnum } from "../../modules/Users/users.types.js"

const userSchema =new Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
    },
    age:Number,
    profileImage:{
        type:String,
    },
    gender:{
        type:Number,
        enum:Object.values(GenderEnum)
    },
    provider:{
        type:Number,
        enum:Object.values(ProviderEnum),
        default:ProviderEnum.system,
    },
    role :{
        type:Number,
        enum:Object.values(RoleEnum),
        default:RoleEnum.user
    },
    bio:String,
    userName:{
        type:String,
        required:true,
        unique:true
    },
    confirmedAt:
    {
        type:Date,
    },
    blockedAt:{
        type:Date,
    }
},
{
    timestamps:true,
    strict:true,
    strictQuery:true,
    optimisticConcurrency:true,
    toJson:{
        virtuals:true,
        getters:true,
        transform(doc,ret)
        {
            delete ret.id
            delete ret.password
            return ret
        }
    },
    toObject:{
        virtuals:true,
        getters:true,
        transform(doc,ret)
        {
            delete ret.id
            return ret
        }
    },
    virtuals:{
        fullname:{
            get(){
                return this.firstname +" "+ this.lastname
            },
            set(value){
                const [firstname,lastname]=value.split(" ")
                if (!firstname || !lastname)
                {
                    throw new Error("Invalid full name format.")
                }
                this.set("firstname",firstname)
                this.set("lastname",lastname)
            }
        }
    }
})

export const userModel = model("Users",userSchema)
