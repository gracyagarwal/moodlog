'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'; // Import useSearchParams to get query parameters
import { Fugaz_One } from 'next/font/google';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext'; 

const fugaz = Fugaz_One({ subsets: ["latin"], weight: ['400'] });

export default function Dashboard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [authenticating, setAuthenticating] = useState(false)
  const [error, setError] = useState('')

  const { signup, login, loginAsGuest, currentUser } = useAuth()
  const searchParams = useSearchParams(); // Get query parameters

  useEffect(() => {
    const registerParam = searchParams.get('register'); // Check if 'register' parameter exists
    if (registerParam === 'true') {
      setIsRegister(true); // Set to register mode if 'register=true'
    }
  }, [searchParams]);

  // Function to validate email format using regex
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Function to validate password strength
  function isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/
    return passwordRegex.test(password)
  }

  async function handleSubmit() {
    if (!isValidEmail(email)) {
      setError('Please provide a valid email address.')
      return
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter.')
      return
    }

    setAuthenticating(true)
    setError('')

    try {
      if (isRegister) {
        console.log('Signing up a new user')
        await signup(email, password)
      } else {
        console.log('Logging in existing user')
        await login(email, password)
      }
    } catch (err) {
      console.log(err.message)
      handleFirebaseError(err)
    } finally {
      setAuthenticating(false)
    }
  }

  function handleFirebaseError(error) {
    switch (error.code) {
      case 'auth/invalid-email':
        setError('Invalid email address format.');
        break;
      case 'auth/user-not-found':
        setError('No account found with this email.');
        break;
      case 'auth/wrong-password':
        setError('Incorrect password.');
        break;
      case 'auth/weak-password':
        setError('Password should be at least 6 characters.');
        break;
      case 'auth/email-already-in-use':
        setError('This email is already in use.');
        break;
      case 'auth/invalid-credential':
        setError('Invalid credentials. Please check your email and password.');
        break;
      default:
        setError('An unexpected error occurred. Please try again.');
        break;
    }
  }

  async function handleGuestLogin() {
    setAuthenticating(true);
    setError('');

    try {
      console.log('Logging in as a guest');
      await loginAsGuest();
      console.log('Logged in as guest');
    } catch (err) {
      console.log(err.message);
      setError('Failed to login as a guest. Please try again.');
    } finally {
      setAuthenticating(false);
    }
  }

  return (
    <div className='flex flex-col flex-1 justify-center items-center gap-4'>
      <h3 className={'text-4xl sm:text-5xl md:text-6xl ' + fugaz.className}>{isRegister ? 'Register' : 'Log In'}</h3>
      <p>You&apos;re one step away!</p>
      {error && <p className='text-red-500'>{error}</p>}
      <input
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
        }}
        className='w-full max-w-[400px] mx-auto px-3 duration-200 hover:border-[#78A2CC] focus:border-[#78A2CC] py-2 sm:py-3 border-2 border-solid border-[#96B9D0] rounded-full outline-none'
        placeholder='Email'
      />
      <input
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
        }}
        className='w-full max-w-[400px] mx-auto px-3 duration-200 hover:border-[#78A2CC] focus:border-[#78A2CC] py-2 sm:py-3 border-2 border-solid border-[#96B9D0] rounded-full outline-none'
        placeholder='Password'
        type='password'
      />
      <div className='max-w-[400px] w-full mx-auto'>
        <Button clickHandler={handleSubmit} text={authenticating ? "Submitting" : "Submit"} full />
      </div>
      <p className='text-center'>
        {isRegister ? 'Already have an account? ' : 'New here? '}
        <button onClick={() => setIsRegister(!isRegister)} className='text-[#78A2CC]'>
          {isRegister ? 'Sign in' : 'Sign up'}
        </button>
      </p>
      <p className='text-center mt-4'>
        Or continue as a 
        <button onClick={handleGuestLogin} className='text-[#78A2CC] ml-2'>
          Guest
        </button>
      </p>
    </div>
  )
}
