import { Schema, Types , model} from "mongoose";

const messageSchema=new Schema({
    content:{
        type:String,
        required:function(){
            return this.images?.length? false : true
        }
    },
    images:{
        type:[String],
    },
    to:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true,
    strict:true,
    strictQuery:true,
    optimisticConcurrency:true,
    toJSON:{
        virtuals:true,
        getters:true,
        transform(doc,ret)
        {
            delete ret.id
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
    }})

export const messageModel = model("Message",messageSchema)
