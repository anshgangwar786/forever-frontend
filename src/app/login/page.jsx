'use client';

import React, { useEffect, useState } from "react";
import { useShopContext } from "../../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";

export default function Login() {
  const [currentState, setCurrentState] = useState("Login");
  const { backendUrl, navigate, token, setToken } = useShopContext();
  const adminUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    "http://localhost:5174";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // 2FA Verification State
  const [is2FAActive, setIs2FAActive] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isBackupMode, setIsBackupMode] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (currentState === "Sign Up") {
        const res = await axios.post(backendUrl + "/api/v1/user/register", {
          name,
          email,
          password,
        });

        if (res.data.success) {
          setToken(res.data.data);
          if (typeof window !== "undefined") {
            localStorage.setItem("token", res.data.data);
          }
          toast.success(res.data.message);
          setName("");
          setEmail("");
          setPassword("");
        } else {
          toast.error(res.data.message);
        }
      } else {
        const res = await axios.post(backendUrl + "/api/v1/user/login", {
          email,
          password,
        });

        if (res.data.success) {
          // Check if Two-Factor Authentication is required
          if (res.data.data?.requires2FA) {
            setTempToken(res.data.data.tempToken);
            setIs2FAActive(true);
            setTwoFactorCode("");
            setIsBackupMode(false);
            toast.info("Two-Factor Authentication required. Please enter your code.");
            return;
          }

          setToken(res.data.data);
          if (typeof window !== "undefined") {
            localStorage.setItem("token", res.data.data);
          }
          setEmail("");
          setPassword("");
          toast.success(res.data.message);
        } else {
          toast.error(res.data.message);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  };

  const onVerify2FAHandler = async (e) => {
    e.preventDefault();

    if (!twoFactorCode.trim()) {
      toast.error(isBackupMode ? "Please enter your backup code" : "Please enter the 6-digit code");
      return;
    }

    setLoading2FA(true);
    try {
      const res = await axios.post(backendUrl + "/api/v1/user/2fa/verify-login", {
        tempToken,
        code: twoFactorCode.trim(),
        isBackupCode: isBackupMode,
      });

      if (res.data.success) {
        setToken(res.data.data);
        if (typeof window !== "undefined") {
          localStorage.setItem("token", res.data.data);
        }
        toast.success("Identity verified! Welcome back.");
        setIs2FAActive(false);
        setTempToken("");
        setTwoFactorCode("");
        setEmail("");
        setPassword("");
        navigate("/");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Verification failed. Please check your code."
      );
    } finally {
      setLoading2FA(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  // If 2FA challenge is active, render the TOTP Verification UI
  if (is2FAActive) {
    return (
      <div className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-14 p-6 sm:p-8 border border-gray-200 rounded-lg shadow-sm text-gray-800 bg-white">
        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-medium tracking-tight mb-1 text-center">
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {isBackupMode
            ? "Enter one of your saved single-use recovery backup codes (e.g. XXXX-XXXX)."
            : "Enter the 6-digit verification code from your Authenticator app (Google Authenticator, Authy, etc.)."}
        </p>

        <form onSubmit={onVerify2FAHandler} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              {isBackupMode ? "Recovery Backup Code" : "6-Digit Security Code"}
            </label>
            <input
              type="text"
              autoFocus
              maxLength={isBackupMode ? 12 : 6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder={isBackupMode ? "XXXX-XXXX" : "123456"}
              className="w-full px-4 py-2.5 text-center text-xl tracking-widest font-mono border border-gray-300 rounded focus:border-black focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading2FA}
            className="w-full bg-black hover:opacity-90 transition text-white py-2.5 rounded text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {loading2FA ? "Verifying..." : "Verify & Sign In"}
          </button>

          <div className="flex flex-col gap-2 pt-2 text-center text-sm border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsBackupMode(!isBackupMode);
                setTwoFactorCode("");
              }}
              className="text-xs text-gray-600 hover:text-black underline cursor-pointer"
            >
              {isBackupMode
                ? "Use 6-digit Authenticator code instead"
                : "Lost phone? Use a recovery backup code"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIs2FAActive(false);
                setTempToken("");
                setTwoFactorCode("");
              }}
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer mt-1"
            >
              &larr; Back to password login
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      {currentState === "Login" ? (
        ""
      ) : (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Name"
          required
        />
      )}
      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Password"
        required
      />
      <div className="w-full flex justify-between text-sm -mt-2">
        {currentState === "Login" ? (
          <Link href="/contact" className="text-base hover:underline">
            Forgot your password? Contact support
          </Link>
        ) : (
          ""
        )}
        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="hover:underline text-base cursor-pointer"
          >
            Create Account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="hover:underline text-base cursor-pointer"
          >
            Login Here
          </p>
        )}
      </div>
      <button className="bg-black hover:scale-95 transition text-white font-light px-8 py-2 mt-4 cursor-pointer">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>

      <div className="w-full mt-6 pt-5 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-medium">Are you a merchant?</p>
        <a
          href={`${adminUrl}/register`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-semibold text-black hover:underline"
        >
          Register as Seller (Admin Portal) &rarr;
        </a>
      </div>
    </form>
  );
}
