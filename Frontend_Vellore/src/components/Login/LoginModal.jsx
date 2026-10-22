import React, { useState, useEffect } from "react";
import {
  Dialog,
  IconButton,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  Fade,
  styled
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useSnackbar } from "notistack";
import axiosinstance from "../../APi/axiosInstance";
import { userApi } from "../../APi/userApi";
import SdsLogo from "../common/SdsLogo";

const DEMO_CREDENTIALS = {
  email: "priya.sharma@example.com",
  password: "Demo@1234"
};

// ── Luxury Styled Components (Shri Deepaalaya Silks Editorial Standard) ──

const LuxuryDialog = styled(Dialog)({
  '& .MuiBackdrop-root': {
    backdropFilter: 'blur(4px)',
    backgroundColor: 'rgba(26, 22, 21, 0.65)',
  },
  '& .MuiPaper-root': {
    borderRadius: '2px',
    width: '430px',
    maxWidth: '94vw',
    backgroundColor: '#FCFBF7',
    boxShadow: '0 24px 60px rgba(40, 35, 33, 0.25)',
    border: '1px solid #C5A15A',
    overflow: 'hidden',
    position: 'relative',
    padding: 0,
    margin: '16px',
  }
});

const LuxuryInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '2px',
    backgroundColor: '#FFFFFF',
    fontFamily: "'Karla', sans-serif",
    fontSize: '0.92rem',
    color: '#282321',
    transition: 'all 0.25s ease',
    '& fieldset': {
      borderColor: '#EDE2D2',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#C5A15A',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6D1734',
      borderWidth: '1.5px',
    },
  },
  '& .MuiInputBase-input': {
    padding: '13px 14px',
    '&::placeholder': {
      color: '#9C9189',
      opacity: 1,
    }
  },
  '& .MuiFormHelperText-root': {
    marginLeft: '2px',
    marginTop: '4px',
    fontSize: '0.75rem',
    color: '#b91c1c',
  }
});

const PrimaryEditorialBtn = styled(Button)({
  height: '46px',
  borderRadius: '2px',
  textTransform: 'uppercase',
  fontWeight: 700,
  fontSize: '0.8rem',
  letterSpacing: '0.18em',
  fontFamily: "'Karla', sans-serif",
  backgroundColor: '#211E1D',
  color: '#FFFFFF',
  border: '1px solid #211E1D',
  boxShadow: '0 4px 14px rgba(33, 30, 29, 0.16)',
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  '&:hover': {
    backgroundColor: '#6D1734',
    borderColor: '#C5A15A',
    boxShadow: '0 6px 20px rgba(109, 23, 52, 0.25)',
  },
  '&:disabled': {
    backgroundColor: '#E5DFD7',
    color: '#A89F96',
    borderColor: '#E5DFD7',
  }
});

const LoginModal = ({ open, onClose, onLoginSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeForm, setActiveForm] = useState("login"); // 'login' | 'register' | 'verify-otp' | 'forgot-password'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    otp: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resendTimer, setResendTimer] = useState(0);
  const [googleReady, setGoogleReady] = useState(false);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const showSnackbar = (message, variant = "info") => {
    enqueueSnackbar(message, { variant, autoHideDuration: 3000, preventDuplicate: true });
  };

  useEffect(() => {
    if (!open || !GOOGLE_CLIENT_ID) return;
    const scriptId = "google-identity-script";
    const handleInit = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          const credential = response?.credential;
          if (!credential) return;
          setLoading(true);
          try {
            const result = await userApi.googleLogin(credential);
            localStorage.removeItem("userLoggedOut");
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            localStorage.setItem("isLoggedIn", "true");
            window.dispatchEvent(new Event("loginStateChanged"));
            showSnackbar("Signed in successfully", "success");
            onLoginSuccess(true);
            onClose();
          } catch (error) {
            showSnackbar(error.response?.data?.message || "Authentication failed", "error");
          } finally {
            setLoading(false);
          }
        },
      });
      setGoogleReady(true);
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = handleInit;
      document.body.appendChild(script);
    } else {
      handleInit();
    }
  }, [open, GOOGLE_CLIENT_ID]);

  useEffect(() => {
    if (!googleReady || !open || activeForm !== "login") return;
    const renderBtn = () => {
      const el = document.getElementById("modal-google-btn");
      if (el && window.google?.accounts?.id) {
        el.innerHTML = "";
        window.google.accounts.id.renderButton(el, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 320,
        });
      }
    };
    const timer = setTimeout(renderBtn, 200);
    return () => clearTimeout(timer);
  }, [googleReady, activeForm, open]);

  useEffect(() => {
    if (!open) {
      setFormData({ name: "", email: "", password: "", contact: "", otp: "" });
      setFormErrors({});
      setActiveForm("login");
      setShowPassword(false);
      setResetStep(1);
      setResendTimer(0);
    }
  }, [open]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showSnackbar("Please enter both email and password", "warning");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosinstance.post("/user/login", {
        email: formData.email,
        password: formData.password,
      });
      localStorage.removeItem("userLoggedOut");
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("loginStateChanged"));
      showSnackbar("Signed in successfully", "success");
      onLoginSuccess(true);
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid email or password";
      showSnackbar(msg, "error");
      if (msg.toLowerCase().includes("email")) setFormErrors(prev => ({ ...prev, email: msg }));
      else if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("credentials")) setFormErrors(prev => ({ ...prev, password: msg }));
      if (msg === "Please verify your account first") {
        localStorage.setItem("userEmail", formData.email);
        setActiveForm("verify-otp");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, contact } = formData;
    if (!name || !email || !password || !contact) {
      showSnackbar("Please fill in all registration fields", "warning");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosinstance.post("/user/register", { name, email, password, contact });
      showSnackbar(response.data.message || "Account created! Please verify your OTP", "success");
      if (response.data.activationToken) {
        localStorage.setItem("activationToken", response.data.activationToken);
      }
      localStorage.setItem("userEmail", email);
      setActiveForm("verify-otp");
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed";
      showSnackbar(msg, "error");
      if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("exist")) setFormErrors(prev => ({ ...prev, email: msg }));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      showSnackbar("Please enter the 6-digit verification code", "warning");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("activationToken");
      const response = await axiosinstance.post(
        "/user/verify",
        { otp: formData.otp },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      showSnackbar(response.data.message || "Account verified successfully", "success");
      localStorage.removeItem("activationToken");
      setActiveForm("login");
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      showSnackbar("Please provide your registered email", "warning");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosinstance.post("/user/forgot-password", { email: formData.email });
      showSnackbar(response.data.message || "Reset code sent to your email", "success");
      setResetStep(2);
      setResendTimer(60);
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Failed to send reset code", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const { email, otp, password } = formData;
    if (!otp || !password) {
      showSnackbar("Verification code and new password are required", "warning");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosinstance.post("/user/reset-password", {
        email,
        resetToken: otp,
        newPassword: password
      });
      showSnackbar(response.data.message || "Password updated successfully", "success");
      setActiveForm("login");
      setResetStep(1);
    } catch (error) {
      showSnackbar(error.response?.data?.message || "Password reset failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LuxuryDialog open={open} onClose={onClose} TransitionComponent={Fade}>
      {/* ── Top Header with Brand Logo and Close Button ── */}
      <Box sx={{
        pt: 3.5,
        pb: 2,
        px: 3.5,
        textAlign: 'center',
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #EDE2D2'
      }}>
        <IconButton
          onClick={onClose}
          aria-label="Close dialog"
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: '#6D1734',
            borderRadius: '2px',
            p: '6px',
            '&:hover': { backgroundColor: 'rgba(109, 23, 52, 0.08)' }
          }}
        >
          <X size={18} />
        </IconButton>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <SdsLogo width={190} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            color: '#6E6259',
            fontSize: '0.82rem',
            letterSpacing: '0.04em'
          }}
        >
          Heritage Silks · Handcrafted Ethnic Couture
        </Typography>

        {/* ── Editorial Tabs (Sign In / Create Account) ── */}
        {(activeForm === 'login' || activeForm === 'register') && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
            mt: 2.5,
            pt: 1,
            borderTop: '1px solid #F0EAE1'
          }}>
            <Box
              onClick={() => setActiveForm('login')}
              sx={{
                cursor: 'pointer',
                pb: 0.75,
                borderBottom: activeForm === 'login' ? '2px solid #6D1734' : '2px solid transparent',
                color: activeForm === 'login' ? '#1A1615' : '#8A7E75',
                fontFamily: "'Karla', sans-serif",
                fontWeight: activeForm === 'login' ? 700 : 500,
                fontSize: '0.82rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                '&:hover': { color: '#6D1734' }
              }}
            >
              Sign In
            </Box>
            <Box
              onClick={() => setActiveForm('register')}
              sx={{
                cursor: 'pointer',
                pb: 0.75,
                borderBottom: activeForm === 'register' ? '2px solid #6D1734' : '2px solid transparent',
                color: activeForm === 'register' ? '#1A1615' : '#8A7E75',
                fontFamily: "'Karla', sans-serif",
                fontWeight: activeForm === 'register' ? 700 : 500,
                fontSize: '0.82rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                '&:hover': { color: '#6D1734' }
              }}
            >
              Create Account
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Main Form Body ── */}
      <Box sx={{ px: { xs: 2.5, sm: 3.5 }, py: 3, backgroundColor: '#FCFBF7' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeForm}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* ═════════ 1. LOGIN FORM ═════════ */}
            {activeForm === 'login' && (
              <form onSubmit={handleLogin}>
                {/* Demo Credentials Fast-Fill Card */}
                <Box
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    email: DEMO_CREDENTIALS.email,
                    password: DEMO_CREDENTIALS.password
                  }))}
                  sx={{
                    mb: 2.5,
                    p: '10px 14px',
                    borderRadius: '2px',
                    backgroundColor: '#FFF8EC',
                    border: '1px dashed #C5A15A',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': {
                      backgroundColor: '#FEF3DF',
                      borderColor: '#6D1734',
                      transform: 'translateY(-1px)'
                    }
                  }}
                  title="Click to fill test credentials"
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: '#6D1734',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        fontFamily: "'Karla', sans-serif"
                      }}
                    >
                      ✦ Fast Access (Click to Fill)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#554A43', fontSize: '0.72rem', fontFamily: "'Karla', sans-serif" }}>
                      {DEMO_CREDENTIALS.email}
                    </Typography>
                  </Box>
                  <Sparkles size={16} color="#C5A15A" />
                </Box>

                <LuxuryInput
                  fullWidth
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  size="small"
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  sx={{ mb: 1.75 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={16} color="#C5A15A" />
                      </InputAdornment>
                    )
                  }}
                />

                <LuxuryInput
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  size="small"
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={16} color="#C5A15A" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} size="small" sx={{ color: '#8A7E75' }}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Box sx={{ mt: 1.25, mb: 2.25, display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography
                    variant="caption"
                    onClick={() => setActiveForm('forgot-password')}
                    sx={{
                      color: '#6D1734',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontFamily: "'Karla', sans-serif",
                      letterSpacing: '0.04em',
                      '&:hover': { textDecoration: 'underline', color: '#4A1025' }
                    }}
                  >
                    Forgot Password?
                  </Typography>
                </Box>

                <PrimaryEditorialBtn fullWidth type="submit" disabled={loading}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In To Account'}
                </PrimaryEditorialBtn>

                {/* Google Sign In Container */}
                <Box sx={{ mt: 2.25, display: 'flex', justifyContent: 'center' }}>
                  <div id="modal-google-btn" />
                </Box>
              </form>
            )}

            {/* ═════════ 2. REGISTER / SIGN UP FORM ═════════ */}
            {activeForm === 'register' && (
              <form onSubmit={handleRegister}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                  <LuxuryInput
                    fullWidth
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    size="small"
                    error={!!formErrors.name}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><User size={15} color="#C5A15A" /></InputAdornment>
                    }}
                  />
                  <LuxuryInput
                    fullWidth
                    name="contact"
                    placeholder="Mobile"
                    value={formData.contact}
                    onChange={handleChange}
                    size="small"
                    error={!!formErrors.contact}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Phone size={15} color="#C5A15A" /></InputAdornment>
                    }}
                  />
                </Box>

                <LuxuryInput
                  fullWidth
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  size="small"
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  sx={{ mb: 1.5 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Mail size={16} color="#C5A15A" /></InputAdornment>
                  }}
                />

                <LuxuryInput
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create Secure Password"
                  value={formData.password}
                  onChange={handleChange}
                  size="small"
                  error={!!formErrors.password}
                  sx={{ mb: 2.5 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock size={16} color="#C5A15A" /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} size="small" sx={{ color: '#8A7E75' }}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <PrimaryEditorialBtn fullWidth type="submit" disabled={loading}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
                </PrimaryEditorialBtn>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#7A6E65', fontSize: '0.78rem' }}>
                    By joining, you agree to our Terms & Privacy Policy.
                  </Typography>
                </Box>
              </form>
            )}

            {/* ═════════ 3. VERIFY OTP FORM ═════════ */}
            {activeForm === 'verify-otp' && (
              <form onSubmit={handleVerifyOTP}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#554A43',
                    mb: 2.5,
                    textAlign: 'center',
                    fontFamily: "'Karla', sans-serif",
                    fontSize: '0.88rem'
                  }}
                >
                  Enter the 6-digit verification code sent to your email to activate your account.
                </Typography>

                <LuxuryInput
                  fullWidth
                  name="otp"
                  placeholder="6-Digit Verification Code"
                  value={formData.otp}
                  onChange={handleChange}
                  size="small"
                  sx={{ mb: 2.5 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><KeyRound size={16} color="#C5A15A" /></InputAdornment>
                  }}
                />

                <PrimaryEditorialBtn fullWidth type="submit" disabled={loading} sx={{ mb: 2 }}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Verify & Continue'}
                </PrimaryEditorialBtn>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="caption"
                    onClick={() => setActiveForm('login')}
                    sx={{ color: '#6D1734', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ← Back to Sign In
                  </Typography>
                </Box>
              </form>
            )}

            {/* ═════════ 4. FORGOT PASSWORD FORM ═════════ */}
            {activeForm === 'forgot-password' && (
              <Box>
                {resetStep === 1 ? (
                  <form onSubmit={handleRequestReset}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#554A43',
                        mb: 2.5,
                        textAlign: 'center',
                        fontFamily: "'Karla', sans-serif",
                        fontSize: '0.88rem'
                      }}
                    >
                      Enter your registered email address to receive password reset instructions.
                    </Typography>

                    <LuxuryInput
                      fullWidth
                      name="email"
                      placeholder="Registered Email"
                      value={formData.email}
                      onChange={handleChange}
                      size="small"
                      sx={{ mb: 2.5 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Mail size={16} color="#C5A15A" /></InputAdornment>
                      }}
                    />

                    <PrimaryEditorialBtn fullWidth type="submit" disabled={loading} sx={{ mb: 2 }}>
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'Send Reset Instructions'}
                    </PrimaryEditorialBtn>

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="caption"
                        onClick={() => setActiveForm('login')}
                        sx={{ color: '#6D1734', cursor: 'pointer', fontWeight: 600 }}
                      >
                        ← Back to Sign In
                      </Typography>
                    </Box>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#554A43',
                        mb: 2.5,
                        textAlign: 'center',
                        fontFamily: "'Karla', sans-serif",
                        fontSize: '0.88rem'
                      }}
                    >
                      Enter the reset code sent to your email and your new password.
                    </Typography>

                    <LuxuryInput
                      fullWidth
                      name="otp"
                      placeholder="Reset Code"
                      value={formData.otp}
                      onChange={handleChange}
                      size="small"
                      sx={{ mb: 1.5 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><KeyRound size={16} color="#C5A15A" /></InputAdornment>
                      }}
                    />

                    <LuxuryInput
                      fullWidth
                      type="password"
                      name="password"
                      placeholder="New Password"
                      value={formData.password}
                      onChange={handleChange}
                      size="small"
                      sx={{ mb: 2.5 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Lock size={16} color="#C5A15A" /></InputAdornment>
                      }}
                    />

                    <PrimaryEditorialBtn fullWidth type="submit" disabled={loading} sx={{ mb: 2 }}>
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Password'}
                    </PrimaryEditorialBtn>

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="caption"
                        onClick={() => setActiveForm('login')}
                        sx={{ color: '#6D1734', cursor: 'pointer', fontWeight: 600 }}
                      >
                        ← Back to Sign In
                      </Typography>
                    </Box>
                  </form>
                )}
              </Box>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>
    </LuxuryDialog>
  );
};

export default LoginModal;
