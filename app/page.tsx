"use client"

import { useEffect, useState } from 'react';

function parseCookies(): string[] {
  let cookies : any = {};
  document.cookie.split(';').map((cookie) => {
    const [name, value]: any = cookie.trim().split('=');
    cookies[name] = decodeURIComponent(value);
  });

  return cookies
}

const Modal = ({ isOpen, onClose, children }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <button className="absolute top-0 right-0 m-4" onClick={onClose}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-gray-500 hover:text-gray-700 cursor-pointer" 
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
            className="text-black"
          />
        </svg>
        </button>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  // State to store the email input value
  const [email, setEmail] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(()=>{

    const cookies: any = parseCookies();
    const {searchParams} = new URL(window.location.href);
    
    const isAuthenticated = async () => {

      if(searchParams.has('token') && searchParams.has('user') && !cookies['twilio_token']){
        document.getElementById('verifyBtn')?.click();
      }
      // Make a GET request to the API endpoint
      if(searchParams.get('logout') != 'true' && (cookies['twilio_token'] || searchParams.has('token'))){
        const response: any = await fetch(`http://localhost:3000/api/login?token=${cookies['twilio_token'] || searchParams.get('token')}`)
        const data = await response.json();
        if(data.ok == 'true')
          window.location.replace(`${searchParams.get('callback')}?token=${cookies['twilio_token'] || searchParams.get('token')}&user=${data.user}`)
      }else{
        await fetch(`http://localhost:3000/api/logout?token=${cookies['twilio_token'] || searchParams.get('token')}`)
      }
      
    };
    
    // Call to check whether user is already authenticated
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

  // Function to handle form submission
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

  // Function to handle email input change
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  return (
    <div className="bg-gray-200 flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-black text-center">Login with Twilio Email</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            Login with Email
          </button>
        </form>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-2xl font-bold mb-4 text-black">Email has been Sent!</h2>
        <p className="text-black">Please Check Your Email {email} to Login.</p>
      </Modal>
      <button type="button" id="verifyBtn" className='hidden' onClick={handleVerifyToken}></button>
    </div>
  );
};

export default LoginPage;

