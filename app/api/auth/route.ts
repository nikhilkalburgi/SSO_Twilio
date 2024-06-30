export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    

    if(searchParams.has('logout')){
        return new Response(`{"status":302,"Location":"http://localhost:3000/?callback=${searchParams.get('callback')}&logout=true"}`, {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        })
    }
    
        return new Response(`{"status":302,"Location":"http://localhost:3000/?callback=${searchParams.get('callback')}"}`, {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        })
}
