import sendgrid from '@sendgrid/mail';
import 'dotenv/config';
import { generateToken, verifyToken } from '../utilities/jwt';

//Simulates an Active Directory
export let userDB: any = ["nikhilkalburgi19@gmail.com"]
export let authState: any = {
  "nikhilkalburgi19@gmail.com": 0
}

export function changeAuthState(email:string,value:number){
  authState[email] = value;
}

sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '');


export const dynamic = 'force-dynamic' // defaults to auto
export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    if(verifyToken(searchParams.get('token') || ''))
      return new Response(`{"ok":"true", "user": "${verifyToken(searchParams.get('token') || "")}" }`, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Set-Cookie': `twilio_token=${searchParams.get('token')}; Path=/; Expires=${new Date(new Date().getTime() + (3600 * 1000)).toUTCString()}; SameSite=Lax`
        },
})
    else
    return new Response(`{"ok":"false"}`, {
      status: 200
})
}

export async function POST(request: Request) {
    const body = await request.json()

    if(userDB.indexOf(body.email) > -1){

      if(authState[body.email] == 2 && body.token){
        return new Response(`{"token":"${body.token}"}`, {
          status: 200
        })
      }
      else if(!body.token){
        const token = generateToken(body.email)
        const msg = {
          to: body.email, // Change to your recipient
          from: 'nikhilkalburgi19@gmail.com', // Change to your verified sender
          subject: 'Twilio SSO',
          html: `<strong>Click <a href="http://localhost:3000/?callback=${body.callback}&token=${token}&user=${body.email}">Here</a> To Login</strong>`,
        };
        
  
          try {
            const result = await sendgrid.send(msg);
            if(result){
              authState[body.email] = 2;
              return new Response(`{"token":"${token}"}`, {
                status: 200
              })
            }
          } catch (error: any) {
            return new Response(`{"token":"Email Failed"}`, {
              status: 200
            })
          }
        
      }else{
        return new Response(`{"token":"Invalid User"}`, {
          status: 200
        })
      }

    }else {
      return new Response(`{"token":"Invalid User"}`, {
        status: 200
      })
    }
}