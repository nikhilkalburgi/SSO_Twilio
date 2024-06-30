import jwt from 'jsonwebtoken';
import { userDB } from '../login/route';
import 'dotenv/config';

const key: string = String(process.env.KEY)
export function generateToken(email: string){
    return jwt.sign(email,key);
}
export function verifyToken(token: string){
    const decryptedToken = jwt.verify(token,key)

    if(userDB.indexOf(decryptedToken) > -1)
    return decryptedToken;
    else
    return null;
}
