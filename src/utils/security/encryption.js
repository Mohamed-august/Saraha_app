import crypto from "node:crypto";
import { errorRes } from "../error.handle.js";



const secretkey=Buffer.from("sjchcchjdh56sjchcchjdh5625lkiuaw")
export const encryption=(data)=>
{
    const iv=crypto.randomBytes(16)
    const cipher=crypto.createCipheriv("aes-256-cbc",secretkey,iv)
    let cipherText=cipher.update(data,"utf-8","hex")
    cipherText+=cipher.final("hex")
    return `${iv.toString("hex")}:${cipherText}`
}

export const decryption=(encryptedValue)=>
{
    const [iv,cipherText]= encryptedValue.split(":") 
    if(!iv || !cipherText)
    {
        errorRes({
            msg:"in-valid encrypted value"
        })
    }
    const binaryIv = Buffer.from(iv,"hex")
    const decipher = crypto.createDecipheriv("aes-256-cbc",secretkey,binaryIv)
    let plaintext = decipher.update(cipherText,"hex","utf-8")
    plaintext+=decipher.final("utf-8")
    return plaintext
}
