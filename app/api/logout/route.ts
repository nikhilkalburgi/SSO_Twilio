import { verifyToken } from '../utilities/jwt';

import { userDB } from '../login/route';

import { changeAuthState } from '../login/route';


export const dynamic = 'force-dynamic' // defaults to auto
export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    if(verifyToken(searchParams.get('token') || '')){
      changeAuthState(String(verifyToken(searchParams.get('token') || "")),1);
      return new Response(`{"ok":"true"}`, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Set-Cookie': 'twilio_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        },
      })
    }
    else
    return new Response(`{"ok":"false"}`, {
      status: 200
})
}