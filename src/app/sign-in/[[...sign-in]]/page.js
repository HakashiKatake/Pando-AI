'use client';

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useSignIn, useAuth } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

function SignInContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  
  const { signIn, setActive, isLoaded } = useSignIn()
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get('type')

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      const redirectUrl = userType === 'organization' ? '/org/dashboard' : '/dashboard'
      router.push(redirectUrl)
    }
  }, [isSignedIn, router, userType])

  const handleEmailPasswordSignIn = async (e) => {
    e.preventDefault()
    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      // Check what verification is needed
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        const redirectUrl = userType === 'organization' ? '/org/dashboard' : '/dashboard'
        router.push(redirectUrl)
      } else if (result.status === 'needs_identifier') {
        setError('Please enter your email address.')
      } else if (result.status === 'needs_password') {
        setError('Please enter your password.')
      } else if (result.status === 'needs_new_password') {
        setError('Your password needs to be reset. Please use the forgot password link.')
      } else if (result.status === 'needs_verification') {
        // Handle verification requirement
        const { unverified_fields, verification } = result
        
        if (unverified_fields?.includes('email_address')) {
          // Email verification needed - try different strategies
          try {
            await signIn.prepareEmailAddressVerification({ strategy: 'email_code' })
            setPendingVerification(true)
            setError('')
          } catch (verificationError) {
            console.error('Email code verification failed:', verificationError)
            
            try {
              await signIn.prepareEmailAddressVerification({ strategy: 'email_link' })
              setError('Please check your email for a verification link.')
            } catch (linkError) {
              console.error('Email link verification failed:', linkError)
              setError('Email verification is required but not configured. Please contact support.')
            }
          }
        } else {
          setError('Verification required but method not supported.')
        }
      } else {
        setError('Sign in failed. Please check your credentials and try again.')
      }
    } catch (err) {
      console.error('Sign in error:', err)
      
     
      if (err.errors && err.errors.length > 0) {
        const errorMessage = err.errors[0].message
        
        if (errorMessage.includes('verification strategy') || errorMessage.includes('not valid for this account')) {
          setError('This account requires email verification. Please check your Clerk dashboard settings or contact support.')
        } else if (errorMessage.includes('password')) {
          setError('Invalid password. Please try again.')
        } else if (errorMessage.includes('identifier')) {
          setError('Invalid email address. Please check and try again.')
        } else if (errorMessage.includes('too many requests')) {
          setError('Too many attempts. Please wait a moment and try again.')
        } else {
          setError(errorMessage)
        }
      } else {
        setError('Sign in failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault()
    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn.attemptEmailAddressVerification({
        code,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        const redirectUrl = userType === 'organization' ? '/org/dashboard' : '/dashboard'
        router.push(redirectUrl)
      } else {
        setError('Verification failed. Please check the code and try again.')
      }
    } catch (err) {
      console.error('Verification error:', err)
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].message)
      } else {
        setError('Verification failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: userType === 'organization' ? '/org/dashboard' : '/dashboard'
      })
    } catch (err) {
      console.error('Google sign in error:', err)
      setError('Google sign in failed. Please try again.')
      setIsLoading(false)
    }
  }

  const getHeaderText = () => {
    if (userType === 'organization') {
      return {
        title: 'Welcome Back, Organization!',
        subtitle: 'Access your organization dashboard and manage classrooms'
      }
    } else if (userType === 'user') {
      return {
        title: 'Welcome Back, Student!',
        subtitle: 'Join your classroom and access wellness tools'
      }
    }
    return {
      title: 'Welcome Back!!',
      subtitle: 'Sign in to continue your wellness journey'
    }
  }

  const headerText = getHeaderText()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  const formVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.8 }
    }
  }

  const capsuleVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 1, ease: "easeOut" }
    }
  }

  // Show verification form if pending
  if (pendingVerification) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
        <motion.div 
          className="min-h-screen flex"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex-1 flex items-center justify-center px-8 py-12">
            <motion.div 
              className="w-full max-w-md"
              variants={formVariants}
            >
              <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#6E55A0' }}>Check Your Email</h1>
                <p className="text-sm" style={{ color: '#8A6FBF' }}>
                  We've sent a verification code to {email}
                </p>
              </motion.div>

              {error && (
                <motion.div 
                  variants={itemVariants}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}

              <motion.form onSubmit={handleVerification} className="space-y-6" variants={itemVariants}>
                <div>
                  <label className="relative inline-block text-sm font-medium mb-2 px-3 py-1 rounded-md" style={{ color: '#6E55A0', backgroundColor: '#E3DEF1' }}>
                    Verification Code
                  </label>
                  <div className="relative mt-2">
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter verification code"
                      className="h-12 border-gray-200 rounded-xl bg-white text-center text-lg tracking-widest"
                      style={{ 
                        borderColor: '#E3DEF1',
                        focusBorderColor: '#8A6FBF',
                        focusRingColor: '#8A6FBF'
                      }}
                      required
                      disabled={isLoading}
                      maxLength={6}
                    />
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit"
                    disabled={isLoading || !isLoaded || !code}
                    className="w-full h-12 text-white rounded-full font-medium text-base transition-all duration-200 disabled:opacity-50"
                    style={{ 
                      background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>
                </motion.div>

                <div className="text-center">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setPendingVerification(false)
                      setCode('')
                      setError('')
                    }}
                    className="text-sm transition-colors duration-200"
                    style={{ color: '#6E55A0' }}
                    whileHover={{ color: '#8A6FBF' }}
                  >
                    ← Back to sign in
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          </div>

          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            {/* Background capsule */}
            <motion.div 
              className="absolute w-[400px] h-[700px] rounded-full"
              style={{ backgroundColor: '#E3DEF1' }}
              variants={capsuleVariants}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
            
            {/* 3D Character Image */}
            <motion.div
              className="relative z-10"
              variants={capsuleVariants}
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <img 
                src="/asset/login.png" 
                alt="3D Character with Laptop" 
                className="w-80 h-80 object-contain"
              />
            </motion.div>
            
            {/* Floating decorative elements */}
            <motion.div
              className="absolute w-8 h-8 rounded-full"
              style={{ backgroundColor: '#8A6FBF', top: '20%', right: '20%' }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute w-6 h-6 rounded-full"
              style={{ backgroundColor: '#6E55A0', top: '70%', right: '30%' }}
              animate={{
                y: [0, 15, 0],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      <motion.div 
        className="min-h-screen flex"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <motion.div 
            className="w-full max-w-md"
            variants={formVariants}
          >
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#6E55A0' }}>
                {headerText.title}
              </h1>
              <p className="text-sm" style={{ color: '#8A6FBF' }}>
                {headerText.subtitle}
              </p>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div 
                variants={itemVariants}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Login Form */}
            <motion.form onSubmit={handleEmailPasswordSignIn} className="space-y-6" variants={itemVariants}>
              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <label className="relative inline-block text-sm font-medium mb-2 px-3 py-1 rounded-md" style={{ color: '#6E55A0', backgroundColor: '#E3DEF1' }}>
                  Email
                </label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@gmail.com"
                    className="pl-10 h-12 border-gray-200 rounded-xl bg-white transition-all duration-200"
                    style={{ 
                      borderColor: '#E3DEF1',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8A6FBF'
                      e.target.style.boxShadow = `0 0 0 3px rgba(138, 111, 191, 0.1)`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E3DEF1'
                      e.target.style.boxShadow = 'none'
                    }}
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <label className="relative inline-block text-sm font-medium mb-2 px-3 py-1 rounded-md" style={{ color: '#6E55A0', backgroundColor: '#E3DEF1' }}>
                  Password
                </label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 border-gray-200 rounded-xl bg-white transition-all duration-200"
                    style={{ 
                      borderColor: '#E3DEF1',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#8A6FBF'
                      e.target.style.boxShadow = `0 0 0 3px rgba(138, 111, 191, 0.1)`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E3DEF1'
                      e.target.style.boxShadow = 'none'
                    }}
                    required
                    disabled={isLoading}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200"
                    whileHover={{ color: '#8A6FBF' }}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              {/* Forgot Password */}
              <motion.div variants={itemVariants} className="text-right">
                <Link href="/forgot-password" className="text-sm transition-colors duration-200" style={{ color: '#6E55A0' }}>
                  Forgot Password?
                </Link>
              </motion.div>

              {/* Login Button */}
              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit"
                  disabled={isLoading || !isLoaded || !email || !password}
                  className="w-full h-12 text-white rounded-full font-medium text-base transition-all duration-200 disabled:opacity-50"
                  style={{ 
                    background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: '#E3DEF1' }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-gray-500" style={{ backgroundColor: '#F7F5FA' }}>- or -</span>
                </div>
              </motion.div>

              {/* Social Login Buttons */}
              <motion.div variants={itemVariants} className="flex gap-4 justify-center">
                {/* Google */}
                <motion.button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || !isLoaded}
                  className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm disabled:opacity-50"
                  style={{ borderColor: '#E3DEF1' }}
                  whileHover={{ 
                    backgroundColor: '#E3DEF1',
                    scale: 1.05
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                </motion.button>
              </motion.div>

              {/* Sign Up Link */}
              <motion.div variants={itemVariants} className="text-center mt-8">
                <span className="text-gray-400 text-sm">Don't have an account? </span>
                <Link 
                  href={`/sign-up${userType ? `?type=${userType}` : ''}`} 
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: '#6E55A0' }}
                >
                  Sign up
                </Link>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>

        {/* Right Side - 3D Character */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          {/* Background capsule */}
          <motion.div 
            className="absolute w-[400px] h-[700px] rounded-full"
            style={{ backgroundColor: '#E3DEF1' }}
            variants={capsuleVariants}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
          
          {/* 3D Character Image */}
          <motion.div
            className="relative z-10"
            variants={capsuleVariants}
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <img 
              src="/asset/login.png" 
              alt="3D Character with Laptop" 
              className="w-80 h-80 object-contain"
            />
          </motion.div>
          
          {/* Floating decorative elements */}
          <motion.div
            className="absolute w-8 h-8 rounded-full"
            style={{ backgroundColor: '#8A6FBF', top: '20%', right: '20%' }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute w-6 h-6 rounded-full"
            style={{ backgroundColor: '#6E55A0', top: '70%', right: '30%' }}
            animate={{
              y: [0, 15, 0],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          {/* Additional floating elements around character */}
          <motion.div
            className="absolute w-4 h-4 rounded-full"
            style={{ backgroundColor: '#D3C3F3', top: '35%', left: '15%' }}
            animate={{
              x: [0, 10, 0],
              y: [0, -10, 0],
              opacity: [0.5, 0.9, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: '#8A6FBF', bottom: '25%', left: '25%' }}
            animate={{
              x: [0, -8, 0],
              y: [0, 12, 0],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F7F5FA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#8A6FBF' }}></div>
          <p style={{ color: '#6E55A0' }}>Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}