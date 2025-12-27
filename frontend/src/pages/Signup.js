import { useState, useEffect } from "react";
import api from "../services/api";
import { useNotification } from '../components/NotificationPopup';

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [step, setStep] = useState("signup"); // 'signup', 'verify', 'success'
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showLoginSuggestion, setShowLoginSuggestion] = useState(false);
  
  // Referral state
  const [referralCode, setReferralCode] = useState("");
  const [referralInfo, setReferralInfo] = useState(null);
  const [referralValidated, setReferralValidated] = useState(false);
  const [referralError, setReferralError] = useState("");
  
  const { showNotification } = useNotification();

  // Extract referral code from URL and validate it
  useEffect(() => {
    const checkReferralFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      
      if (refCode) {
        setReferralCode(refCode);
        await validateReferralCode(refCode);
      }
    };

    checkReferralFromUrl();
  }, []);

  useEffect(() => {
    const checkOAuthSessionMessages = async () => {
      try {
        // Use axios without authentication since this is login page
        const response = await api.get(`/github/session-message`);
        const { oauthError } = response.data;
        
        if (oauthError) {
          // Show error popup notification
          showNotification('error', oauthError);
          // OR if you have a custom error display function:
          // showError(oauthError);
        }
      } catch (error) {
        console.error('Failed to check OAuth session messages:', error);
        // Silently fail - don't show error to user as this is just checking for messages
      }
    };

    checkOAuthSessionMessages();
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateReferralCode = async (code) => {
    if (!code) return;
    
    try {
      const response = await api.post("/referral/validate-code", { code });
      
      if (response.data.success) {
        setReferralInfo(response.data.referral);
        setReferralValidated(true);
        setReferralError("");
        showNotification('success', `Valid referral code from ${response.data.referral.ownerName}!`);
      }
    } catch (error) {
      console.error('Referral validation error:', error);
      setReferralInfo(null);
      setReferralValidated(false);
      setReferralError(error.response?.data?.message || 'Invalid referral code');
      
      // Don't show error notification for URL-based referrals initially
      // Only show if user manually enters a code
      if (code !== new URLSearchParams(window.location.search).get('ref')) {
        showNotification('error', 'Invalid referral code');
      }
    }
  };

  const handleReferralCodeChange = async (newCode) => {
    setReferralCode(newCode);
    setReferralError("");
    
    if (newCode.length >= 3) {
      // Debounce validation
      const timeoutId = setTimeout(() => {
        validateReferralCode(newCode);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setReferralInfo(null);
      setReferralValidated(false);
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("At least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("At least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("At least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("At least one digit");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("At least one special character");
    }

    return errors;
  };

  const isPasswordValid = (password) => {
    return validatePassword(password).length === 0;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (
        step === "signup" &&
        email &&
        password &&
        isValidEmail(email) &&
        isPasswordValid(password)
      ) {
        handleSignUp();
      } else if (step === "verify" && verificationCode.length === 6) {
        handleVerifyEmail();
      }
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      showNotification('warning', 'Please fill in all required fields!');
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      showNotification('warning', 'Please enter a valid email address!');
      return;
    }

    if (!isPasswordValid(password)) {
      setError("Please ensure your password meets all requirements");
      showNotification('warning', 'Password does not meet security requirements!');
      return;
    }

    // If referral code exists but not validated, validate it first
    if (referralCode && !referralValidated) {
      setError("Please wait while we validate your referral code");
      showNotification('warning', 'Validating referral code...');
      return;
    }

    setIsLoading(true);
    setError("");
    setShowLoginSuggestion(false);

    try {
      const signupData = {
        email: email.trim(),
        password: password,
      };

      // Include referral code if provided and validated
      if (referralCode && referralValidated) {
        signupData.referralCode = referralCode;
      }

      const response = await api.post("/auth/signup", signupData);

      console.log("Signup successful:", response.data);

      // Move to verification step
      setStep("verify");
      setResendCooldown(60); // Start 60-second cooldown
      
      const successMessage = referralCode && referralValidated 
        ? `Account created successfully! You were referred by ${referralInfo?.ownerName}. Please check your email for verification code.`
        : 'Account created successfully! Please check your email for verification code.';
      
      showNotification('success', successMessage);
    } catch (err) {
      console.error("Signup error:", err);

      if (err.response?.data?.message) {
        const errorMessage = err.response.data.message;
        
        // For account exists error, show login suggestion instead of generic error
        if (err.response?.status === 409) {
          setShowLoginSuggestion(true);
          setError(""); // Don't show the error message, show the login suggestion instead
          showNotification('warning', 'Account already exists! Please sign in instead.');
        } else {
          setError(errorMessage);
          showNotification('error', 'Signup failed! Please try again.');
        }
      } else if (err.response?.status === 400) {
        setError("Invalid email or password format");
        showNotification('error', 'Invalid email or password format!');
      } else if (err.response?.status === 429) {
        setError("Please wait before requesting another verification code");
        showNotification('warning', 'Too many requests! Please wait before trying again.');
      } else {
        setError("Signup failed. Please try again.");
        showNotification('error', 'Signup failed! Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      showNotification('warning', 'Please enter the complete 6-digit verification code!');
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/verify-email", {
        email: email.trim(),
        code: verificationCode,
      });

      console.log("Verification successful:", response.data);
      
      // After successful verification, automatically log the user in
      try {
        const loginResponse = await api.post("/auth/login", {
          email: email.trim(),
          password: password
        });
        
        // Store the JWT token
        const { token, user } = loginResponse.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        const successMessage = referralCode && referralValidated
          ? `Email verified successfully! You were referred by ${referralInfo?.ownerName}. Welcome to Smellify!`
          : 'Email verified successfully! Welcome to Smellify!';
        
        showNotification('success', successMessage);
        
        // Redirect directly to dashboard after successful signup and verification
        window.location.href = '/dashboard';
        
      } catch (loginErr) {
        console.error('Auto-login after verification failed:', loginErr);
        // If auto-login fails, still show success and redirect to login
        showNotification('success', 'Email verified successfully! Please sign in to continue.');
        setStep("success");
      }
      
    } catch (err) {
      console.error("Verification error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
        showNotification('error', 'Verification failed! Please check your code and try again.');
      } else if (err.message === "Invalid verification code") {
        setError("Invalid verification code. Please try again.");
        showNotification('error', 'Invalid verification code! Please try again.');
      } else {
        setError("Verification failed. Please try again.");
        showNotification('error', 'Verification failed! Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    // Include referral code in GitHub OAuth flow if present
    const githubUrl = referralCode && referralValidated 
      ? `http://localhost:5000/api/github/login?ref=${encodeURIComponent(referralCode)}`
      : `http://localhost:5000/api/github/login`;
    
    window.location.href = githubUrl;
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/resend-verification", {
        email: email.trim(),
      });

      setResendCooldown(60);
      setError(""); // Clear any previous errors
      showNotification('success', 'Verification code resent successfully! Please check your email.');
    } catch (err) {
      console.error("Resend error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
        showNotification('error', 'Failed to resend verification code! Please try again.');
      } else if (err.response?.status === 429) {
        setError("Please wait before requesting another verification code");
        showNotification('warning', 'Too many requests! Please wait before requesting another code.');
      } else {
        setError("Failed to resend verification code. Please try again.");
        showNotification('error', 'Failed to resend verification code! Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignup = () => {
    setStep("signup");
    setVerificationCode("");
    setError("");
    setShowLoginSuggestion(false);
  };

  const handleGoToLogin = () => {
    // Preserve referral code when going to login
    const loginUrl = referralCode 
      ? `/login?ref=${encodeURIComponent(referralCode)}`
      : "/login";
    window.location.href = loginUrl;
  };

  const handleContinueToDashboard = async () => {
    // Update last login before redirecting to dashboard
    try {
      await api.post("/auth/complete-onboarding");
      showNotification('success', 'Welcome to Smellify!');
    } catch (error) {
      console.error("Error updating last login:", error);
      showNotification('warning', 'Welcome to Smellify! Some settings may not be updated.');
    }
    window.location.href = "/dashboard";
  };

  const getStepTitle = () => {
    switch (step) {
      case "signup":
        return "Sign up for Smellify";
      case "verify":
        return "Verify your email";
      case "success":
        return "Welcome to Smellify!";
      default:
        return "Sign up for Smellify";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "signup":
        return referralCode && referralValidated 
          ? `Create your account to get started (Referred by ${referralInfo?.ownerName})`
          : "Create your account to get started";
      case "verify":
        return `We've sent a verification code to ${email}`;
      case "success":
        return "Your account has been created successfully!";
      default:
        return "Create your account to get started";
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Smellify!
            </h1>
            <p className="text-gray-500 mb-8">
              Your account has been created and verified successfully.
              {referralCode && referralValidated && (
                <span className="block mt-2 text-blue-600 font-medium">
                  Thanks for using {referralInfo?.ownerName}'s referral!
                </span>
              )}
            </p>
            <button
              onClick={handleContinueToDashboard}
              className="w-full bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-900 transition-all duration-200"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // return (
  //   <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  //     <div className="max-w-md w-full">
  //       {/* Main Card */}
  //       <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
  //         {/* Header */}
  //         <div className="text-center mb-8">
  //           <h1 className="text-3xl font-bold text-gray-900 mb-2">
  //             {getStepTitle()}
  //           </h1>
  //           <p className="text-gray-500">{getStepDescription()}</p>
  //         </div>

  //         {/* Referral Code Display (if from URL) */}
  //         {referralCode && step === "signup" && (
  //           <div className={`mb-6 p-4 rounded-xl border ${
  //             referralValidated 
  //               ? "bg-green-50 border-green-200" 
  //               : referralError 
  //                 ? "bg-red-50 border-red-200"
  //                 : "bg-blue-50 border-blue-200"
  //           }`}>
  //             <div className="flex items-center">
  //               <div className="flex-shrink-0">
  //                 {referralValidated ? (
  //                   <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
  //                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  //                   </svg>
  //                 ) : referralError ? (
  //                   <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
  //                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  //                   </svg>
  //                 ) : (
  //                   <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
  //                 )}
  //               </div>
  //               <div className="ml-3">
  //                 <p className={`text-sm font-medium ${
  //                   referralValidated 
  //                     ? "text-green-800" 
  //                     : referralError 
  //                       ? "text-red-800"
  //                       : "text-blue-800"
  //                 }`}>
  //                   {referralValidated 
  //                     ? `Referred by ${referralInfo?.ownerName} (${referralCode})`
  //                     : referralError 
  //                       ? `Invalid referral code: ${referralCode}`
  //                       : `Validating referral code: ${referralCode}`
  //                   }
  //                 </p>
  //               </div>
  //             </div>
  //           </div>
  //         )}

  //         {/* GitHub Login Button - Only show on signup step */}
  //         {step === "signup" && (
  //           <>
  //             {/* OAuth Button */}
  //             <button 
  //               onClick={handleGitHubLogin}
  //               className="w-full mb-6 bg-white border-2 border-gray-200 rounded-xl py-3 px-4 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
  //             >
  //               <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
  //                 <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  //               </svg>
  //               <span className="font-semibold text-gray-700">
  //                 Continue with GitHub
  //                 {referralCode && referralValidated && (
  //                   <span className="text-xs text-blue-600 block">
  //                     (Referred by {referralInfo?.ownerName})
  //                   </span>
  //                 )}
  //               </span>
  //             </button>

  //             {/* Divider */}
  //             <div className="relative mb-6">
  //               <div className="absolute inset-0 flex items-center">
  //                 <div className="w-full border-t border-gray-200"></div>
  //               </div>
  //               <div className="relative flex justify-center text-sm">
  //                 <span className="px-4 bg-white text-gray-500">or</span>
  //               </div>
  //             </div>
  //           </>
  //         )}

  //         {/* Progress Indicator */}
  //         <div className="flex items-center justify-center mb-8">
  //           <div className="flex items-center space-x-2">
  //             {/* Step 1: Email & Password */}
  //             <div
  //               className={`w-3 h-3 rounded-full ${
  //                 step === "signup" || step === "verify"
  //                   ? "bg-blue-600"
  //                   : "bg-gray-300"
  //               }`}
  //             ></div>

  //             {/* Connector between steps */}
  //             <div
  //               className={`w-8 h-1 ${
  //                 step === "verify" ? "bg-blue-600" : "bg-gray-300"
  //               }`}
  //             ></div>

  //             {/* Step 2: Verification */}
  //             <div
  //               className={`w-3 h-3 rounded-full ${
  //                 step === "verify" ? "bg-blue-600" : "bg-gray-300"
  //               }`}
  //             ></div>
  //           </div>
  //         </div>

  //         {/* Error Message */}
  //         {error && (
  //           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
  //             <div className="flex">
  //               <div className="flex-shrink-0">
  //                 <svg
  //                   className="h-5 w-5 text-red-400"
  //                   viewBox="0 0 20 20"
  //                   fill="currentColor"
  //                 >
  //                   <path
  //                     fillRule="evenodd"
  //                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
  //                     clipRule="evenodd"
  //                   />
  //                 </svg>
  //               </div>
  //               <div className="ml-3">
  //                 <p className="text-sm text-red-800">{error}</p>
  //               </div>
  //             </div>
  //           </div>
  //         )}

  //         {/* Account Exists Error with Login Link */}
  //         {showLoginSuggestion && step === "signup" && (
  //           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
  //             <div className="flex">
  //               <div className="flex-shrink-0">
  //                 <svg
  //                   className="h-5 w-5 text-red-400"
  //                   viewBox="0 0 20 20"
  //                   fill="currentColor"
  //                 >
  //                   <path
  //                     fillRule="evenodd"
  //                     d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
  //                     clipRule="evenodd"
  //                   />
  //                 </svg>
  //               </div>
  //               <div className="ml-3 flex-1">
  //                 <p className="text-sm text-red-800 mb-2">
  //                   An account with this email already exists.
  //                 </p>
  //                 <button
  //                   onClick={handleGoToLogin}
  //                   className="text-sm font-medium text-red-600 hover:text-red-700 underline"
  //                 >
  //                   Sign in instead →
  //                 </button>
  //               </div>
  //             </div>
  //           </div>
  //         )}

  //         {/* Signup Form */}
  //         {step === "signup" && (
  //           <div className="space-y-6">
  //             {/* Referral Code Field (if not from URL) */}
  //             {!referralCode && (
  //               <div>
  //                 <label className="block text-sm font-semibold text-gray-900 mb-2">
  //                   Referral Code (Optional)
  //                 </label>
  //                 <input
  //                   type="text"
  //                   value={referralCode}
  //                   onChange={(e) => handleReferralCodeChange(e.target.value.toUpperCase())}
  //                   className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
  //                   placeholder="Enter referral code"
  //                 />
  //                 {referralError && (
  //                   <p className="text-xs text-red-600 mt-1">{referralError}</p>
  //                 )}
  //                 {referralValidated && referralInfo && (
  //                   <p className="text-xs text-green-600 mt-1">
  //                     Valid code from {referralInfo.ownerName}
  //                   </p>
  //                 )}
  //               </div>
  //             )}

  //             {/* Email Field */}
  //             <div>
  //               <label className="block text-sm font-semibold text-gray-900 mb-2">
  //                 Email address
  //               </label>
  //               <input
  //                 type="email"
  //                 value={email}
  //                 onChange={(e) => setEmail(e.target.value)}
  //                 onKeyPress={handleKeyPress}
  //                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
  //                 placeholder="Enter your email address"
  //               />
  //             </div>

  //             {/* Password Field */}
  //             <div>
  //               <label className="block text-sm font-semibold text-gray-900 mb-2">
  //                 Password
  //               </label>
  //               <div className="relative">
  //                 <input
  //                   type={showPasswordText ? "text" : "password"}
  //                   value={password}
  //                   onChange={(e) => setPassword(e.target.value)}
  //                   onKeyPress={handleKeyPress}
  //                   className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
  //                   placeholder="Enter your password"
  //                   autoComplete="new-password"
  //                 />
  //                 <button
  //                   type="button"
  //                   onClick={() => setShowPasswordText(!showPasswordText)}
  //                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 flex items-center justify-center w-5 h-5 z-10"
  //                 >
  //                   {showPasswordText ? (
  //                     <svg
  //                       className="w-5 h-5"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       viewBox="0 0 24 24"
  //                     >
  //                       <path
  //                         strokeLinecap="round"
  //                         strokeLinejoin="round"
  //                         strokeWidth={1.5}
  //                         d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88"
  //                       />
  //                     </svg>
  //                   ) : (
  //                     <svg
  //                       className="w-5 h-5"
  //                       fill="none"
  //                       stroke="currentColor"
  //                       viewBox="0 0 24 24"
  //                     >
  //                       <path
  //                         strokeLinecap="round"
  //                         strokeLinejoin="round"
  //                         strokeWidth={1.5}
  //                         d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178z"
  //                       />
  //                       <path
  //                         strokeLinecap="round"
  //                         strokeLinejoin="round"
  //                         strokeWidth={1.5}
  //                         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
  //                       />
  //                     </svg>
  //                   )}
  //                 </button>
  //               </div>

  //               {/* Password Requirements */}
  //               {password && (
  //                 <div className="mt-3 p-3 bg-gray-50 rounded-lg">
  //                   <p className="text-xs font-semibold text-gray-700 mb-2">
  //                     Password requirements:
  //                   </p>
  //                   <div className="space-y-1">
  //                     <div
  //                       className={`flex items-center text-xs ${
  //                         password.length >= 8
  //                           ? "text-green-600"
  //                           : "text-gray-500"
  //                       }`}
  //                     >
  //                       <svg
  //                         className={`w-3 h-3 mr-2 ${
  //                           password.length >= 8
  //                             ? "text-green-500"
  //                             : "text-gray-400"
  //                         }`}
  //                         fill="currentColor"
  //                         viewBox="0 0 20 20"
  //                       >
  //                         <path
  //                           fillRule="evenodd"
  //                           d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
  //                           clipRule="evenodd"
  //                         />
  //                       </svg>
  //                       At least 8 characters
  //                     </div>
  //                     <div
  //                       className={`flex items-center text-xs ${
  //                         /[A-Z]/.test(password)
  //                           ? "text-green-600"
  //                           : "text-gray-500"
  //                       }`}
  //                     >
  //                       <svg
  //                         className={`w-3 h-3 mr-2 ${
  //                           /[A-Z]/.test(password)
  //                             ? "text-green-500"
  //                             : "text-gray-400"
  //                         }`}
  //                         fill="currentColor"
  //                         viewBox="0 0 20 20"
  //                       >
  //                         <path
  //                           fillRule="evenodd"
  //                           d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
  //                           clipRule="evenodd"
  //                         />
  //                       </svg>
  //                       One uppercase letter
  //                     </div>
  //                     <div
  //                       className={`flex items-center text-xs ${
  //                         /[a-z]/.test(password)
  //                           ? "text-green-600"
  //                           : "text-gray-500"
  //                       }`}
  //                     >
  //                       <svg
  //                         className={`w-3 h-3 mr-2 ${
  //                           /[a-z]/.test(password)
  //                             ? "text-green-500"
  //                             : "text-gray-400"
  //                         }`}
  //                         fill="currentColor"
  //                         viewBox="0 0 20 20"
  //                       >
  //                         <path
  //                           fillRule="evenodd"
  //                           d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
  //                           clipRule="evenodd"
  //                         />
  //                       </svg>
  //                       One lowercase letter
  //                     </div>
  //                     <div
  //                       className={`flex items-center text-xs ${
  //                         /\d/.test(password)
  //                           ? "text-green-600"
  //                           : "text-gray-500"
  //                       }`}
  //                     >
  //                       <svg
  //                         className={`w-3 h-3 mr-2 ${
  //                           /\d/.test(password)
  //                             ? "text-green-500"
  //                             : "text-gray-400"
  //                         }`}
  //                         fill="currentColor"
  //                         viewBox="0 0 20 20"
  //                       >
  //                         <path
  //                           fillRule="evenodd"
  //                           d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
  //                           clipRule="evenodd"
  //                         />
  //                       </svg>
  //                       One number
  //                     </div>
  //                     <div
  //                       className={`flex items-center text-xs ${
  //                         /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  //                           ? "text-green-600"
  //                           : "text-gray-500"
  //                       }`}
  //                     >
  //                       <svg
  //                         className={`w-3 h-3 mr-2 ${
  //                           /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
  //                             password
  //                           )
  //                             ? "text-green-500"
  //                             : "text-gray-400"
  //                         }`}
  //                         fill="currentColor"
  //                         viewBox="0 0 20 20"
  //                       >
  //                         <path
  //                           fillRule="evenodd"
  //                           d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
  //                           clipRule="evenodd"
  //                         />
  //                       </svg>
  //                       One special character
  //                     </div>
  //                   </div>
  //                 </div>
  //               )}
  //             </div>

  //             {/* Sign Up Button */}
  //             <button
  //               onClick={handleSignUp}
  //               disabled={
  //                 isLoading ||
  //                 !email ||
  //                 !password ||
  //                 !isValidEmail(email) ||
  //                 !isPasswordValid(password) ||
  //                 (referralCode && !referralValidated)
  //               }
  //               className="w-full bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
  //             >
  //               {isLoading ? (
  //                 <>
  //                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
  //                   Creating account...
  //                 </>
  //               ) : (
  //                 <>
  //                   Sign Up
  //                   {referralCode && referralValidated && (
  //                     <span className="text-xs ml-2 bg-white/20 px-2 py-1 rounded">
  //                       +Referral
  //                     </span>
  //                   )}
  //                   <svg
  //                     className="w-4 h-4 ml-2"
  //                     fill="none"
  //                     stroke="currentColor"
  //                     viewBox="0 0 24 24"
  //                   >
  //                     <path
  //                       strokeLinecap="round"
  //                       strokeLinejoin="round"
  //                       strokeWidth={2}
  //                       d="M9 5l7 7-7 7"
  //                     />
  //                   </svg>
  //                 </>
  //               )}
  //             </button>
  //           </div>
  //         )}

  //         {/* Email Verification Step - Same as before */}
  //         {step === "verify" && (
  //           <div className="space-y-6">
  //             {/* Email Icon */}
  //             <div className="flex justify-center">
  //               <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
  //                 <svg
  //                   className="w-8 h-8 text-blue-600"
  //                   fill="none"
  //                   stroke="currentColor"
  //                   viewBox="0 0 24 24"
  //                 >
  //                   <path
  //                     strokeLinecap="round"
  //                     strokeLinejoin="round"
  //                     strokeWidth={2}
  //                     d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
  //                   />
  //                 </svg>
  //               </div>
  //             </div>

  //             {/* Verification Input */}
  //             <div>
  //               <label className="block text-sm font-semibold text-gray-900 mb-2">
  //                 Verification Code
  //               </label>
  //               <input
  //                 type="text"
  //                 value={verificationCode}
  //                 onChange={(e) => {
  //                   const value = e.target.value.replace(/\D/g, "").slice(0, 6);
  //                   setVerificationCode(value);
  //                 }}
  //                 onKeyPress={handleKeyPress}
  //                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest font-mono"
  //                 placeholder="123456"
  //                 maxLength="6"
  //                 autoFocus
  //               />
  //               <p className="text-xs text-gray-500 mt-2 text-center">
  //                 Enter the 6-digit code we sent to your email
  //               </p>
  //             </div>

  //             {/* Resend Section */}
  //             <div className="text-center">
  //               <p className="text-sm text-gray-600 mb-2">
  //                 Didn't receive the code?
  //               </p>
  //               <button
  //                 onClick={handleResendCode}
  //                 disabled={resendCooldown > 0 || isLoading}
  //                 className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
  //               >
  //                 {resendCooldown > 0
  //                   ? `Resend code in ${resendCooldown}s`
  //                   : "Resend verification code"}
  //               </button>
  //             </div>

  //             {/* Verify Button */}
  //             <button
  //               onClick={handleVerifyEmail}
  //               disabled={isLoading || verificationCode.length !== 6}
  //               className="w-full bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
  //             >
  //               {isLoading ? (
  //                 <>
  //                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
  //                   Verifying...
  //                 </>
  //               ) : (
  //                 <>
  //                   Verify Email
  //                   <svg
  //                     className="w-4 h-4 ml-2"
  //                     fill="none"
  //                     stroke="currentColor"
  //                     viewBox="0 0 24 24"
  //                   >
  //                     <path
  //                       strokeLinecap="round"
  //                       strokeLinejoin="round"
  //                       strokeWidth={2}
  //                       d="M9 5l7 7-7 7"
  //                     />
  //                   </svg>
  //                 </>
  //               )}
  //             </button>

  //             {/* Back to signup */}
  //             <div className="text-center">
  //               <button
  //                 onClick={handleBackToSignup}
  //                 className="text-gray-600 hover:text-gray-700 font-medium text-sm flex items-center justify-center mx-auto"
  //               >
  //                 <svg
  //                   className="w-4 h-4 mr-1"
  //                   fill="none"
  //                   stroke="currentColor"
  //                   viewBox="0 0 24 24"
  //                 >
  //                   <path
  //                     strokeLinecap="round"
  //                     strokeLinejoin="round"
  //                     strokeWidth={2}
  //                     d="M15 19l-7-7 7-7"
  //                   />
  //                 </svg>
  //                 Back to signup
  //               </button>
  //             </div>
  //           </div>
  //         )}

  //         {/* Footer */}
  //         {step === "signup" && (
  //           <div className="mt-8 text-center">
  //             <p className="text-gray-500">
  //               Already have an account?{" "}
  //               <button
  //                 onClick={handleGoToLogin}
  //                 className="text-gray-900 font-semibold hover:underline transition-colors duration-200"
  //               >
  //                 Sign in
  //               </button>
  //             </p>
  //           </div>
  //         )}
  //       </div>

  //       {/* Bottom Links */}
  //       {step === "signup" && (
  //         <div className="mt-6 text-center space-x-4 text-sm">
  //           <a href="#" className="text-gray-500 hover:text-gray-700">
  //             Privacy Policy
  //           </a>
  //           <span className="text-gray-300">•</span>
  //           <a href="#" className="text-gray-500 hover:text-gray-700">
  //             Terms of Service
  //           </a>
  //         </div>
  //       )}
  //     </div>

  //     {/* CSS to hide browser password toggle */}
  //     <style jsx>{`
  //       input[type="password"]::-ms-reveal,
  //       input[type="password"]::-ms-clear {
  //         display: none;
  //       }
  //       input[type="password"]::-webkit-credentials-auto-fill-button,
  //       input[type="password"]::-webkit-strong-password-auto-fill-button {
  //         display: none !important;
  //       }
  //     `}</style>
  //   </div>
  // );

return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 pt-20">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex w-full lg:w-1/2 flex-col items-center text-center order-1 lg:order-2 pl-16">
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: "#5A33FF" }}
          >
            <img
              src="/bug.png"
              alt="BugTracker Logo"
              className="w-24 h-24 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML =
                  '<svg class="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z"/></svg>';
              }}
            />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Smellify
          </h1>
          <p className="text-lg lg:text-xl text-gray-600">
            {getStepDescription()}
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 max-w-md order-1 lg:order-2">
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Referral Code Display (if from URL) */}
            {referralCode && step === "signup" && (
              <div className={`mb-6 p-4 rounded-xl border ${
                referralValidated 
                  ? "bg-green-50 border-green-200" 
                  : referralError 
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
              }`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {referralValidated ? (
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : referralError ? (
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      referralValidated 
                        ? "text-green-800" 
                        : referralError 
                          ? "text-red-800"
                          : "text-blue-800"
                    }`}>
                      {referralValidated 
                        ? `Referred by ${referralInfo?.ownerName} (${referralCode})`
                        : referralError 
                          ? `Invalid referral code: ${referralCode}`
                          : `Validating referral code: ${referralCode}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Exists Error with Login Link */}
            {showLoginSuggestion && step === "signup" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-red-800 mb-2">
                      An account with this email already exists.
                    </p>
                    <button
                      onClick={handleGoToLogin}
                      className="text-sm font-medium hover:underline"
                      style={{ color: '#5A33FF' }}
                    >
                      Sign in instead →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Email Verification Step */}
            {step === 'verify' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(90, 51, 255, 0.1)' }}>
                    <svg className="w-8 h-8" style={{ color: '#5A33FF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setVerificationCode(value);
                    }}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest font-mono"
                    placeholder="123456"
                    maxLength="6"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Enter the 6-digit code we sent to your email
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: '#5A33FF' }}
                  >
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : "Resend verification code"}
                  </button>
                </div>

                <button
                  onClick={handleVerifyEmail}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ backgroundColor: '#5A33FF' }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign in'
                  )}
                </button>

                <div className="text-center">
                  <button
                    onClick={handleBackToSignup}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#5A33FF' }}
                  >
                    ← Back to signup
                  </button>
                </div>
              </div>
            )}

            {/* Signup Form */}
            {step === 'signup' && (
              <div className="space-y-5">
                {/* GitHub Button */}
                <button 
                  onClick={handleGitHubLogin}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg py-3 px-4 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-gray-700">
                    Continue with GitHub
                    {referralCode && referralValidated && (
                      <span className="text-xs text-blue-600 block">
                        (Referred by {referralInfo?.ownerName})
                      </span>
                    )}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or continue with</span>
                  </div>
                </div>

                {/* Referral Code Field (if not from URL) */}
                {!referralCode && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => handleReferralCodeChange(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Enter referral code"
                    />
                    {referralError && (
                      <p className="text-xs text-red-600 mt-1">{referralError}</p>
                    )}
                    {referralValidated && referralInfo && (
                      <p className="text-xs text-green-600 mt-1">
                        Valid code from {referralInfo.ownerName}
                      </p>
                    )}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordText ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Enter your password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPasswordText ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  {password && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Password requirements:
                      </p>
                      <div className="space-y-1">
                        <div className={`flex items-center text-xs ${password.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                          <svg className={`w-3 h-3 mr-2 ${password.length >= 8 ? "text-green-500" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          At least 8 characters
                        </div>
                        <div className={`flex items-center text-xs ${/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}`}>
                          <svg className={`w-3 h-3 mr-2 ${/[A-Z]/.test(password) ? "text-green-500" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          One uppercase letter
                        </div>
                        <div className={`flex items-center text-xs ${/[a-z]/.test(password) ? "text-green-600" : "text-gray-500"}`}>
                          <svg className={`w-3 h-3 mr-2 ${/[a-z]/.test(password) ? "text-green-500" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          One lowercase letter
                        </div>
                        <div className={`flex items-center text-xs ${/\d/.test(password) ? "text-green-600" : "text-gray-500"}`}>
                          <svg className={`w-3 h-3 mr-2 ${/\d/.test(password) ? "text-green-500" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          One number
                        </div>
                        <div className={`flex items-center text-xs ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "text-green-600" : "text-gray-500"}`}>
                          <svg className={`w-3 h-3 mr-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "text-green-500" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          One special character
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sign Up Button */}
                <button
                  onClick={handleSignUp}
                  disabled={isLoading || !email || !password || !isValidEmail(email) || !isPasswordValid(password) || (referralCode && !referralValidated)}
                  className="w-full text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ backgroundColor: '#5A33FF' }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Creating account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>

                {/* Sign In Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <button
                      onClick={handleGoToLogin}
                      className="font-semibold hover:underline transition-colors duration-200"
                      style={{ color: '#5A33FF' }}
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hide browser password toggle */}
      <style jsx>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
        input[type="password"]::-webkit-credentials-auto-fill-button,
        input[type="password"]::-webkit-strong-password-auto-fill-button {
          display: none !important;
        }
      `}</style>
    </div>
  );
}