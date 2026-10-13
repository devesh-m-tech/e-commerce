import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosinstance from "../../APi/axiosInstance";
import { userApi } from "../../APi/userApi";
import { useSnackbar } from 'notistack';
import { User, Mail, Lock, Phone, KeyRound, Sparkles, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import SdsLogo from "../common/SdsLogo";
import { DUMMY_CREDENTIALS } from "../../mockData/mockApiHandler";
import "./login.css";

const Login = ({ onLogin, initialForm = "login" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    otp: "",
    newPassword: "",
  });
  const [activeForm, setActiveForm] = useState(
    location.pathname === "/signup" ? "register" : initialForm || "login"
  );
  const [resetStep, setResetStep] = useState(1);
  const [activationToken, setActivationToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // If already logged in, redirect home
    const token = localStorage.getItem("token");
    const isLoggedOut = localStorage.getItem("userLoggedOut") === "true";
    if (token && !isLoggedOut) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const showSnackbar = (message, variant = "info") => {
    enqueueSnackbar(message, { variant, autoHideDuration: 3000, preventDuplicate: true });
  };

  const handleLoginSubmit = async (e) => {
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
      if (onLogin) onLogin(true);
      navigate("/");
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid email or password";
      showSnackbar(msg, "error");
      if (msg.toLowerCase().includes("email")) setFormErrors(prev => ({ ...prev, email: msg }));
      else if (msg.toLowerCase().includes("password")) setFormErrors(prev => ({ ...prev, password: msg }));
      if (msg === "Please verify your account first") {
        localStorage.setItem("userEmail", formData.email);
        setActiveForm("verify-otp");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, contact } = formData;
    if (!name || !email || !password || !contact) {
      showSnackbar("All fields are required to register", "warning");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosinstance.post("/user/register", { name, email, password, contact });
      showSnackbar(response.data.message || "Registration successful! Please verify code", "success");
      if (response.data.activationToken) {
        localStorage.setItem("activationToken", response.data.activationToken);
        setActivationToken(response.data.activationToken);
      }
      localStorage.setItem("userEmail", email);
      setActiveForm("verify-otp");
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed";
      showSnackbar(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      showSnackbar("Please enter the verification code", "warning");
      return;
    }
    setLoading(true);
    try {
      const token = activationToken || localStorage.getItem("activationToken");
      const response = await axiosinstance.post(
        "/user/verify",
        { otp: formData.otp },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      showSnackbar(response.data.message || "Account verified! Please sign in", "success");
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
      showSnackbar(response.data.message || "Reset instructions sent to your email", "success");
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
    const { email, otp, newPassword } = formData;
    if (!otp || !newPassword) {
      showSnackbar("Both verification code and new password are required", "warning");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosinstance.post("/user/reset-password", {
        email,
        resetToken: otp,
        newPassword
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
    <div className="sds-auth-page">
      <div className="sds-auth-card">
        {/* Back to Home Link */}
        <Link to="/" className="sds-auth-back-link">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        {/* Brand Header */}
        <div className="sds-auth-header">
          <Link to="/" className="sds-auth-logo">
            <SdsLogo width={200} />
          </Link>
          <p className="sds-auth-subtitle">Heritage Silks · Handcrafted Ethnic Couture</p>
        </div>

        {/* Tab Switcher */}
        {(activeForm === "login" || activeForm === "register") && (
          <div className="sds-auth-tabs">
            <button
              type="button"
              className={`sds-auth-tab ${activeForm === "login" ? "active" : ""}`}
              onClick={() => setActiveForm("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`sds-auth-tab ${activeForm === "register" ? "active" : ""}`}
              onClick={() => setActiveForm("register")}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="sds-auth-body">
          {/* ── 1. Sign In ── */}
          {activeForm === "login" && (
            <form onSubmit={handleLoginSubmit}>
              {/* Fast Demo Credentials */}
              <div
                className="sds-demo-credentials-banner"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  email: DUMMY_CREDENTIALS.email,
                  password: DUMMY_CREDENTIALS.password
                }))}
                title="Click to fill test credentials"
              >
                <div>
                  <span className="sds-demo-label">✦ Fast Demo Access (Click to Fill)</span>
                  <span className="sds-demo-email">{DUMMY_CREDENTIALS.email}</span>
                </div>
                <Sparkles size={16} color="#C5A15A" />
              </div>

              <div className="sds-input-wrapper">
                <span className="sds-input-icon"><Mail size={16} color="#C5A15A" /></span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sds-input-wrapper">
                <span className="sds-input-icon"><Lock size={16} color="#C5A15A" /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="sds-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="sds-auth-actions-row">
                <button
                  type="button"
                  className="sds-auth-link"
                  onClick={() => setActiveForm("forgot-password")}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="sds-btn-editorial-auth" disabled={loading}>
                {loading ? "Signing In..." : "Sign In To Account"}
              </button>
            </form>
          )}

          {/* ── 2. Create Account ── */}
          {activeForm === "register" && (
            <form onSubmit={handleRegisterSubmit}>
              <div className="sds-input-grid-2">
                <div className="sds-input-wrapper">
                  <span className="sds-input-icon"><User size={15} color="#C5A15A" /></span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="sds-input-wrapper">
                  <span className="sds-input-icon"><Phone size={15} color="#C5A15A" /></span>
                  <input
                    type="tel"
                    name="contact"
                    placeholder="Mobile Number"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="sds-input-wrapper">
                <span className="sds-input-icon"><Mail size={16} color="#C5A15A" /></span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sds-input-wrapper">
                <span className="sds-input-icon"><Lock size={16} color="#C5A15A" /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create Secure Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="sds-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" className="sds-btn-editorial-auth" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <p className="sds-auth-terms">
                By joining, you agree to Shri Deepaalaya Silks' Terms of Service & Privacy Policy.
              </p>
            </form>
          )}

          {/* ── 3. Verify OTP ── */}
          {activeForm === "verify-otp" && (
            <form onSubmit={handleVerifyOTP}>
              <p className="sds-auth-notice">
                Enter the 6-digit verification code sent to your email to verify your account.
              </p>
              <div className="sds-input-wrapper">
                <span className="sds-input-icon"><KeyRound size={16} color="#C5A15A" /></span>
                <input
                  type="text"
                  name="otp"
                  placeholder="6-Digit Verification Code"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="sds-btn-editorial-auth" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
              <div className="sds-auth-switch-link">
                <button type="button" onClick={() => setActiveForm("login")}>
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ── 4. Forgot Password ── */}
          {activeForm === "forgot-password" && (
            <div>
              {resetStep === 1 ? (
                <form onSubmit={handleRequestReset}>
                  <p className="sds-auth-notice">
                    Enter your registered email address to receive password reset instructions.
                  </p>
                  <div className="sds-input-wrapper">
                    <span className="sds-input-icon"><Mail size={16} color="#C5A15A" /></span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Registered Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button type="submit" className="sds-btn-editorial-auth" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Instructions"}
                  </button>
                  <div className="sds-auth-switch-link">
                    <button type="button" onClick={() => setActiveForm("login")}>
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <p className="sds-auth-notice">
                    Enter the reset code sent to your email and your new password.
                  </p>
                  <div className="sds-input-wrapper">
                    <span className="sds-input-icon"><KeyRound size={16} color="#C5A15A" /></span>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Reset Code"
                      value={formData.otp}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="sds-input-wrapper">
                    <span className="sds-input-icon"><Lock size={16} color="#C5A15A" /></span>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button type="submit" className="sds-btn-editorial-auth" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                  <div className="sds-auth-switch-link">
                    <button type="button" onClick={() => setActiveForm("login")}>
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
