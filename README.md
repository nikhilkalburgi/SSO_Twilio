# Build An SSO Ecosystem With Nextjs And SendGrid

## Introduction
Single Sign-On (SSO) is a centralized user authentication system that allows users to authenticate once and gain access to multiple applications within a predefined ecosystem without needing to re-enter their credentials. 

Twilio SendGrid can play a crucial role in achieving SSO by enhancing the security and authentication process. Twilio SendGrid facilitates secure email communications for user verification, password resets, and multi-factor authentication. These features can be combined to compose this SSO ecosystem

In this tutorial, you will learn to set up a free Sendgrid account and integrate it with the Next.js application to send a verification mail to log in to a dummy application. 

By the end of this tutorial, you will understand:
Working with SSO in real-world applications.
The utility of Twilio SendGrid in the security and authentication process.
Integration of SendGrid in Next.js with Sendgrid API and npm @sendgrid/mail.

## Prerequisites
 
Node v18 and NPM v9 - If not installed on your system, you can follow the guide at nodejs.org 
A Twilio SendGrid account - if you’re new to Twilio/SendGrid create a free account or, if you already have an account, log in
NPM packages you need are nextjs 14.x, jsonwebtoken, @sendgrid/mail, @types/jsonwebtoken.
Also, you may use an active directory or the Database for storing user data. You will use memory to simulate here in this project.


## Set up your SendGrid account and the API key

Login to your SendGrid  Account. You should see the dashboard on your screen as shown below:

Move to Settings > API Keys and Click on the Create API Key button:

On the Prompt, you can provide the key name and also select Full Access. This will generate a secret key value which you can copy and add to your project:

Sendgrid allows you to create multiple keys to authenticate the API for email-related operations. You will use this secret value in your project to authenticate the npm `@sendgrid/mail` package. You should see the list of API Keys on your SendGrid dashboard:

Install `dotenv` npm package and create .env file to the root of your project which you will create next. Paste the copied API key to this file in the following format.

```text
SENDGRID_API_KEY= <Paste the Key Here …>
```

## Building the app

This project consists of two applications: one for SSO with SendGrid and a dummy app that will utilize our SSO system. When a user opens the application in any browser, the app will immediately send an authentication check request to the SSO. If the user is not authenticated, the app will redirect them to the SSO login page. Upon entering their email and clicking the login button, the user will receive an email allowing them to log in to the app. Once authenticated, the user's session will be retained as a cookie for one hour or until they log out. Any subsequent access to the app will not require repeating the login process, as the authenticated state will persist. Additionally, you can create another instance of the app that will use the same token from the SSO stored in the cookie.

Working on this project in detailed steps:
1. The user opens the my-app-one on the browser using http://localhost:3000
1. my-app-one redirects to the my-sso using auth API
1. my-sso checks if the user is already authenticated using the login API. If not then it displays the login UI to the user. After the user enters the email ID, mail is sent to the user’s mailbox using SendGrid.
1. The user has to click the link in the mail to get redirected back to my-sso, get verified as authenticated, and then switch to the my-app-one home page.
1. After verification, my-sso redirects the user to my-app-one with a cookie for the future login process.
1. During logout, the my-app-one sends the request to the logout API. Then, log out gets rid of a cookie, and sets the overall state as unauthenticated.

## Set up the project

You should start by creating two new nextjs projects one with the name my-sso and the other for my-app-one  by using the following commands one after the other:

```bash
npx create-next-app my-sso // First
npx create-next-app my-app-one // Second
```

You will be prompted to select settings for both the above commands, you can select the defaults( with Tailwind as Yes and Typescript as Yes). Finally, change the working directory to the respective project folder in your terminal and run the projects in parallel using two terminals or one after the other. Use the below commands:

```bash
cd my-sso
npm run dev
```
```bash
cd my-app-one
npm run dev
```
Install the dependencies to both projects:
```bash
npm install @sendgrid/mail jsonwebtoken 
```
This will ensure that the applications are working fine. Now, proceed to build SSO with Sendgrid. 

## Building the SSO with Twilio Sendgrid

Before you start building something, you go through the initial structure of the project my-sso.

```text
my-sso/
└── app/
    └── globals.css
    └── layout.tsx
    └── page.tsx
└── public/
└── .env, package.json, etc.
```



The nextjs project uses folders as routers. It contains an important folder called app which contains your main code. The app folder contains the following files:
page.tsx: the route to the root path or this is like the index.js page
layout.tsx: the layout of the web page
globals.css: CSS code globally applicable and comes integrated with tailwind
The public folder is where you add your media files.
The project has some configuration files like package.json, tailwind.config.ts, etc.

You will be only focusing on the app folder to build this app. Change it as shown below by adding an api folder for operations like authentication check, login, logout, and encryption. These are the small services you require in the SSO system.

```text
my-sso/
└── app/
   └── api/
        ├── login/route.js 
        ├── logout/route.js 
        ├── utilities/route.js 
        └── auth/route.js
    └── globals.css
    └── layout.tsx
    └── page.tsx
└── public/
└── .env, package.json, etc.
```

First, you understand the structure of the page.tsx file inside app folder. This will contain the markup of the Login page UI and will connect to the api folder operations for specific actions.

## Build the Login UI using the following code

Add the following code to page.tsx. 

```js
"use client";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Add login logic here...
  };

  return (
    <div className="bg-gray-200 flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-black text-center">
             Login with Twilio Email
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
               Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className=" w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
            Login with Email
          </button>
        </form>
      </div>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-4 text-black">Email Sent!</h2>
          <p className="text-black">Please check your email {email} to login.</p>
        </Modal>
      )}
      <button type="button" id="verifyBtn" className='hidden' onClick={handleVerifyToken}></button>
    </div>
  );
};

export default LoginPage;
```  


`use client` indicates that this runs on the client. You are creating a form here to submit the credentials to the SSO system in case when you are not already logged in. The code has a hidden button to indirectly make a fetch request to avoid the CORS errors which you will understand later in this tutorial. The code uses Tailwind to design the form structure like it is adding a model to show the Email sent event to the user.

Build login with Sendgrid email

Inside the `handleSubmit`, you will add the logic to call `api/login` route and start the authentication process. You will use the fetch method to make a POST request to login API which you will define later in this tutorial. Ultimately, It gets the response and if success then it displays the Tailwind modal that was developed earlier.

```js hl_lines = “3 31”
const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const {searchParams} = new URL(window.location.href);

    if(!searchParams.has('callback')) return;

    try {
      const response: any = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'        
        },
        body: JSON.stringify({ email, callback: searchParams.get('callback')}),
      });

      const json = await response.json();

      if (json.token != 'Invalid User') {
        // Handle success
        console.log('Request sent successfully');
        openModal()

      } else {
        // Handle errors
        console.error('Error sending request:', response.statusText);
      }
    } catch (error) {
      // Handle network errors
      console.error('Network error:', error);
    }
  };
```

If the fetch call gets a negative response, then the same will be logged on the console or if it gets a positive response, then it opens the Model. In this fetch call, you are requesting SendGrid to send a mail to the user specified on the input field of the login UI. Now, understand every operation (route.ts) inside api folder.

Login:

Add the below code inside the login/route.ts file:

```js
import 'dotenv/config';
import { generateToken, verifyToken } from '../utilities/jwt';
import sendgrid from '@sendgrid/mail';
//Simulates an Active Directory with one user
export let userDB: any = ["test@email.com"]
export let authState: any = {
  "test@email.com": 0
}
// This is for internal use and tells if the user is verified
export function changeAuthState(email:string,value:number){
  authState[email] = value;
}

// You can get this from sendgrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '');

export const dynamic = 'force-dynamic' // defaults to auto

// To check if the user token is valid.
export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    if(verifyToken(searchParams.get('token') || ''))
      return new Response(`{"ok":"true", "user": "${verifyToken(searchParams.get('token') || "")}" }`, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Set-Cookie': `twilio_token=${body.token}; Path=/; Expires=${new Date(new Date().getTime() + (3600 * 1000)).toUTCString()}; SameSite=Lax`
        },
})
    else
    return new Response(`{"ok":"false"}`, {
      status: 200
})
}

// The Login Button action
export async function POST(request: Request) {
    const body = await request.json()
   // If the user email is valid based on assumed Active directory
    if(userDB.indexOf(body.email) > -1){
       //Value 2 says that the user has returned from mail with the token.
      if(authState[body.email] == 2 && body.token){
        return new Response(`{"token":"${body.token}"}`, {
          status: 200
        })
      }
      else if(!body.token){
        const token = generateToken(body.email)
       // email to be sent
    }else {
      return new Response(`{"token":"Invalid User"}`, {
        status: 200
      })
    }
}
```



This is what the above fetch method calls. Here, you have two things happening. GET request handling to check if the user URL has the valid token and POST request handling to create a token with `jsonwebtoken` npm package and then send it through the mail using SendGrid.

In GET request, you send a reply with `Set-Cookie` header and set a third-party cookie for 1 hour when the user request asks for the verification of the mailed URL.

In the above logic, you maintain every user's authentication state in the simulated active directory. `authState[user_email]` of `2` indicates that the user has received the mail and is revisiting to verify the link from an email. Then, after GET request handler is used to redirect the user to my-app-one home page if the obtained token is valid. 

You are also using the utility function called `generateToken` to implement the token generation process with `jsonwebtoken` and it is defined later in this tutorial.

You get the token from the Login Page of the SSO in the form of a query parameter. This is parsed using the URL class.
Replace `//email to be sent` in login/route.js with the following code which will create the email content and send it to the specified recipient.


```js
const msg = {
          to: body.email, 
          from: 'test_email', // Change to your verified sender
          subject: 'Twilio SSO',
          html: `<strong>Click <a href="http://localhost:3000/?callback=${body.callback}&token=${token}&user=${body.email}">Here</a> To Login</strong>`,
        };
          try {
            const result = await sendgrid.send(msg);
            if(result){
              authState[body.email] = 2;
              return new Response(`{"token":"${token}"}`, {
                status: 200,
                headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
              })
            }
          } catch (error: any) {
            return new Response(`{"token":"Email Failed"}`, {
              status: 200
           })
}
```
 
The above code sends a mail to the user and sets the `authState` of the user to `2` indicating that the user has completed receiving the login link. Now, the user can check his mailbox and click on it to verify for the first click.

You can send the `Access-Control-Allow-*` headers to avoid any CORS policy issues in your browser that usually occur when you hit a fetch request from the client request.
This above login/route.ts route uses a utility function for encryption and decryption. So, create  utilities/jwt.ts in api folder which contains two functions `generateToken` and `verifyToken` that help you in this process with `jsonwebtoken`.

```js
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
```

Do not forget to import `dotenv/config` otherwise, you won't be able to fetch the key that you have added to the .env file.

In `verifyToken`, you are additionally verifying the existence of the user after finding that the token is valid. `jwt.verify` returns the email ID that you used to generate the token in `generateToken` function. 

You are using `secret` as the key to build the JWT token. However, I would suggest dynamically creating random keys per user and storing them to verify later on.


Now, come back to the `login/route.ts` file. To use the `sendgrid.send` method, import its npm package to the top of the `login/route.ts` file. This method accepts an object with the following basic properties:

```text
   to: Address of the recipient. In our case it is the user's email ID
   from: This can be any email ID that you want to show as a source. Change to
   your verified sender
   subject: Subject of the email
   html: The HTML body to render on the mail
```
This finally ensures that your login function is fully developed. Continue by adding the following code before `handleSubmit` method on page.tsx file.

```js
useEffect(()=>{

    const cookies: any = parseCookies();
    const {searchParams} = new URL(window.location.href);
    
    const isAuthenticated = async () => {

      if(searchParams.has('token') && searchParams.has('user') && !cookies['twilio_token']){
        document.getElementById('verifyBtn')?.click();
      }
      // Make a GET request to the API endpoint
      if(searchParams.get('logout') != 'true' && (cookies['twilio_token'] || searchParams.has('token')))
{
        const response: any = await 
fetch(`http://localhost:3000/api/login?token=${cookies['twilio_token'] || searchParams.get('token')}`)
        const data = await response.json();
        if(data.ok == 'true')
          window.location.replace(`${searchParams.get('callback')}?token=${cookies['twilio_token'] || searchParams.get('token')}&user=${data.user}`)
      }else{
        await fetch(`http://localhost:3000/api/logout?token=${cookies['twilio_token']}`)
      }
      
    };
    
    // Call to check whether the user is already authenticated
      if(searchParams.has('callback') && (cookies['twilio_token'] || searchParams.has('token')))
        isAuthenticated();
  },[])

const handleVerifyToken = async (event: any) => {
  event.preventDefault();
  const {searchParams} = new URL(window.location.href);
  const cookies: any = parseCookies();

  if(!searchParams.has('user') || !searchParams.get('token')) return;
  const response: any = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'        
        },
        body: JSON.stringify({email: searchParams.get('user'), token: searchParams.get('token') }),
      });
      const json = await response.json();

      if (json.token != 'Invalid User' && json.token != 'Email Failed') {     
        window.location.replace(`${searchParams.get('callback')}?token=${cookies['twilio_token']}&user=${searchParams.get('user')}`)
      }
}
```

Here, you have a `useEffect` hook that runs whenever this page is loaded on the browser. This hook is responsible for checking if the user is authenticated. It has various conditions. The first one checks if the token and callback on the URL are available(The token from the cookie is also checked) and clicks the hidden button (To avoid CORS policy) when the condition holds true. You then send a GET request to the login API that you developed before this and check if the token is valid. You also do the logout operation in the same method if the user requests for logout. You make a GET request to logout API with the occupied cookie from the user’s browser. You will develop this logout API soon in this tutorial.

The `handleVerifyToken` is attached to the hidden button that you created earlier. In this method, you are making a POST request with email and token to login API. If the login API does not send Invalid User or Email Failed as a response then you redirect the user to the my-app-one home page. This method is triggered when the user clicks the link shared with Sendgrid mail.

You use `window.location` API to perform redirect operations on the browser.

To make the logout operation work, you should create logout/route.ts file in api folder and add the following code.
```js
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
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
})
}
```

This logout method verifies the token using `verifyToken` method and also verifies the existence of the user in the simulated Active Directory. If logout is successful then it will set the `authState` of the user back to 1.

You have another API called `auth/route.ts` defined inside api folder. This API is responsible for making the first interaction with the applications and redirecting them to the Login Page for both login and logout operations. So, create auth/route.js and add the following code:

```js
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
```

Here, you will not return the status message as 302 instead will send a message with the status as 302 that will indicate that the server is asking to redirect to the responded Location Property. This GET method handler will be used to initiate Login and Logout operations.

In Location, you are adding the path to the page.tsx with callback. The callback is the URL of the app. In this case, it will be the URL where the my-app-one is hosted.
You will always send this callback URL as a query parameter.

If you want to log out then you need to send a logout parameter set to true.

This puts the development of SSO to an end. Now, you will create an App that will use this SSO.

## Building a sample app to demonstrate the working of SSO

You have already built the my-app-one in the setup section. Do not change the defaults of this project and enable the ts language.

The structure of the project should be as simple as below.

```js
my-app-one/
└── app/
    └── globals.css
    └── layout.tsx
    └── page.tsx
└── public/
└── .env, package.json, etc.
```


 Here, you only need app/page.tsx page to build the entire app. 

The page.tsx will contain the basic UI for the User welcome.

```js
"use client"
import {useEffect, useState} from 'react';

const App1LandingPage = () => {
  
  const [logoutError, setLogoutError] = useState("");
  const [user, setUser] = useState("");

//Leave this space to add some other code logic that is given below in this tutorial

  const handleLogout = async () => {
    try {
      // Make a fetch request to logout API
      const response = await fetch(`http://localhost:3000/api/auth?callback=http://${window.location.host}&logout=true`,{cache:'no-cache'});
      const json = await response.json();
      if(json.status == 302){
        window.location.assign(json.Location);
      }
      // Check if the request was successful
      if (!response.ok) {
        // Handle logout error
        setLogoutError('Failed to logout');
      }
    } catch (error) {
      // Handle fetch error
      setLogoutError('Failed to logout');
    }
  };
    

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-4 text-black">App One Dashboard</h1>
      {
      (user)?
      <>
      <h2 className="text-xl font-semibold mb-6 text-black"> Hi {user}! Welcome to your dashboard! </h2>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleLogout}>Logout</button>
      </>
      
      : <h2 className="text-xl font-semibold mb-6 text-black">Redirecting you to Login Page...</h2>
      }
      {logoutError && <p className="text-red-500 mb-4">Error: {logoutError}</p>}
    </div>
  );
};

export default App1LandingPage;
```

This UI will contain a logout button that calls `handleLogout` method. This method will make a call to the `auth` API and get redirected to the `logout` API of SSO project you created earlier.

As this code runs on the client side it is important to add “use client“ on top of the file.

You also need to add a `useEffect` that will run to check if the current user was already authenticated with a fetch request to SSO. The following code inside `App1LandingPage` will perform it. Replace `//Leave this space to add some other code logic that is given below in this tutorial` with the below code 


```js
const verifyUser = async () => {
    // Make a GET request to the API endpoint
        const cookies: any = parseCookies();
        const {searchParams} = new URL(window.location.href);
       // If token is part of URL
        if(searchParams.has('token') && searchParams.has('user')){
          const response: any = await fetch(`http://localhost:3000/api/login?token=${searchParams.get('token')}`,{cache:'no-cache'});
          const json = await response.json();
          if(json.ok == 'false'){
            window.location.assign(`http://localhost:3000/?callback=${window.location.host}`);
          }
        }else{
          // Call to ./auth if the user has no token in URL
          const response: any = await fetch(`http://localhost:3000/api/auth?callback=http://${window.location.host}`,{cache:'no-cache'});
          const json = await response.json();
          if(json.status == 302){
            window.location.assign(json.Location);
          }
        }
        
    };

  useEffect(()=>{

    verifyUser();
    const {searchParams} = new URL(window.location.href);
    const text: any = (searchParams.get('user'))
    if(text)
    setUser(text)
  },[])
```

Also, define the `parseCookies` function to parse the cookie in the browser and send the token in it to the SSO.









```js
function parseCookies(): string[] {
  let cookies : any = {};
  document.cookie.split(';').map((cookie) => {
    const [name, value]: any = cookie.trim().split('=');
    cookies[name] = decodeURIComponent(value);
  });

  return cookies
}
```

In the above code, you are fetching the cookies that belong to this site and filtering out the `twilio_token` that is configured from my-sso login operation after the user is redirected from the link in the mail.

This code is trying to check with the my-sso if the user is already authenticated and the stored cookie (if any) is valid. 

Testing, troubleshooting, or product demonstration

Run both my-sso and my-app-one on two separate terminals using the following code for each.

```bash
npm run dev
```

This should run both applications in parallel. Firstly, run the my-sso app and then my-app-one. This will ensure that my-sso runs at port 3000 and my-app-one runs at port 3001.

Open http://localhost:3001/ on your favorite browser. It will immediately redirect you to the my-sso login page.



Enter the valid email that is already added to the `userDB` variable in login/route.ts file and click on Login with Email. After you receive your email with the link to the verification, you will see the below modal appearing on the screen. 

Now, you can open your email and click on the Here hyperlink. 



It will redirect you to the SSO page which will in turn direct you to the my-app-one home page with a cookie set on your browser for 1 hour.



If you enter any other email for login then it will not respond to your action. You can create your way of exception handling.

## Conclusion

This article has uncovered an indispensable tool for the authentication process. Twilio SendGrid emerges as a robust platform, offering seamless email delivery solutions backed by intuitive APIs. Its versatility extends beyond email delivery to streamline authentication processes. Together, Twilio SendGrid and SSO present powerful solutions for enhancing user experience. You can visit Twilio Email API to unlock a world of possibilities for enhancing communication in your applications. You can find the entire code of this tutorial on this GitHub Repository.

Nikhil S Kalburgi is a Software Developer and a Technical Content Writer. He is very much involved in Open Source Development and loves to share his learnings by writing. 


