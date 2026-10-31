'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useShopContext } from "../../context/ShopContext";

export default function ProfilePage() {
  const { backendUrl, token, navigate } = useShopContext();

  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [remainingBackupCodes, setRemainingBackupCodes] = useState(0);

  // Setup 2FA Modal / State
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState([]);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);

  // Disable 2FA Modal / State
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);

  // Regenerate Backup Codes Modal / State
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [regenCode, setRegenCode] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);

  // Fetch 2FA status and profile
  const fetch2FAStatus = async () => {
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (!activeToken) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(backendUrl + "/api/v1/user/2fa/status", {
        headers: { token: activeToken },
      });

      if (res.data.success) {
        setTwoFactorEnabled(res.data.data.twoFactorEnabled);
        setRemainingBackupCodes(res.data.data.remainingBackupCodes || 0);
        setUserInfo(res.data.data.user);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load security profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch2FAStatus();
  }, [token]);

  // Initiate 2FA Setup
  const handleStartSetup = async () => {
    try {
      setSetupLoading(true);
      const activeToken = token || localStorage.getItem("token");
      const res = await axios.post(
        backendUrl + "/api/v1/user/2fa/setup",
        {},
        { headers: { token: activeToken } }
      );

      if (res.data.success) {
        setQrCode(res.data.data.qrCode);
        setManualKey(res.data.data.manualEntryKey);
        setVerificationCode("");
        setSetupModalOpen(true);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to start 2FA setup"
      );
    } finally {
      setSetupLoading(false);
    }
  };

  // Confirm 2FA Setup with 6-digit code
  const handleVerifySetup = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    try {
      setSetupLoading(true);
      const activeToken = token || localStorage.getItem("token");
      const res = await axios.post(
        backendUrl + "/api/v1/user/2fa/verify-setup",
        { code: verificationCode.trim() },
        { headers: { token: activeToken } }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setTwoFactorEnabled(true);
        setSetupModalOpen(false);
        setNewBackupCodes(res.data.data.backupCodes || []);
        setShowBackupCodesModal(true);
        fetch2FAStatus();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Invalid verification code. Please try again."
      );
    } finally {
      setSetupLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!disablePassword && !disableCode) {
      toast.error("Please enter your current password or 6-digit code");
      return;
    }

    try {
      setDisableLoading(true);
      const activeToken = token || localStorage.getItem("token");
      const res = await axios.post(
        backendUrl + "/api/v1/user/2fa/disable",
        {
          password: disablePassword.trim(),
          code: disableCode.trim(),
        },
        { headers: { token: activeToken } }
      );

      if (res.data.success) {
        toast.success("Two-Factor Authentication has been disabled");
        setTwoFactorEnabled(false);
        setDisableModalOpen(false);
        setDisablePassword("");
        setDisableCode("");
        fetch2FAStatus();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to disable 2FA"
      );
    } finally {
      setDisableLoading(false);
    }
  };

  // Regenerate Backup Codes
  const handleRegenerateBackupCodes = async (e) => {
    e.preventDefault();
    if (!regenCode.trim()) {
      toast.error("Please enter your 6-digit authenticator code");
      return;
    }

    try {
      setRegenLoading(true);
      const activeToken = token || localStorage.getItem("token");
      const res = await axios.post(
        backendUrl + "/api/v1/user/2fa/regenerate-backup-codes",
        { code: regenCode.trim() },
        { headers: { token: activeToken } }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setRegenModalOpen(false);
        setRegenCode("");
        setNewBackupCodes(res.data.data.backupCodes || []);
        setShowBackupCodesModal(true);
        fetch2FAStatus();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to regenerate backup codes"
      );
    } finally {
      setRegenLoading(false);
    }
  };

  const copyToClipboard = (text, message = "Copied to clipboard!") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.info(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="border-t pt-10 pb-16 px-4 sm:px-8 max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-gray-900">
          Account & Security
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your profile details and protect your account with Two-Factor Authentication.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Details Card */}
        <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
          <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-medium mb-4">
            {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{userInfo?.name || "User"}</h2>
          <p className="text-sm text-gray-500">{userInfo?.email}</p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800 capitalize">
              Role: {userInfo?.role || "Customer"}
            </span>
            {userInfo?.storeName && (
              <p className="text-xs text-gray-500 mt-2">
                Store: <span className="font-medium text-gray-700">{userInfo.storeName}</span>
              </p>
            )}
          </div>
        </div>

        {/* 2FA Card */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  Two-Factor Authentication (TOTP)
                  {twoFactorEnabled ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Off
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                  Use an authenticator app (such as Google Authenticator, Microsoft Authenticator, or Authy) to generate one-time security codes each time you sign in.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              {twoFactorEnabled ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50/60 rounded-md border border-green-200 text-green-900 text-sm">
                    <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <p className="font-medium">Your account is protected by Two-Factor Authentication.</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        Remaining unused backup codes: <span className="font-semibold">{remainingBackupCodes}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-2">
                    <button
                      onClick={() => setRegenModalOpen(true)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-xs font-medium transition cursor-pointer"
                    >
                      Regenerate Backup Codes
                    </button>
                    <button
                      onClick={() => setDisableModalOpen(true)}
                      className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded text-xs font-medium transition cursor-pointer"
                    >
                      Disable 2FA
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Enhance your account security
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Prevent unauthorized access even if your password is compromised.
                    </p>
                  </div>
                  <button
                    onClick={handleStartSetup}
                    disabled={setupLoading}
                    className="bg-black hover:opacity-90 text-white px-5 py-2.5 rounded text-xs font-medium transition cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    {setupLoading ? "Generating..." : "Enable 2FA"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: SETUP 2FA */}
      {setupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-gray-900">
                Setup Two-Factor Authentication
              </h3>
              <button
                onClick={() => setSetupModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl"
              >
                &times;
              </button>
            </div>

            <ol className="text-xs text-gray-600 space-y-2 mb-4 list-decimal list-inside">
              <li>Open <strong>Google Authenticator</strong> or <strong>Authy</strong> on your phone.</li>
              <li>Scan the QR code below or manually paste the Secret Key.</li>
              <li>Enter the 6-digit verification code generated by the app.</li>
            </ol>

            {/* QR Code Display */}
            {qrCode && (
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                <img
                  src={qrCode}
                  alt="Authenticator QR Code"
                  className="w-48 h-48 rounded"
                />
                <div className="mt-3 text-center">
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Manual Secret Key
                  </p>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-gray-200">
                    <code className="text-xs font-mono text-gray-800 break-all select-all">
                      {manualKey}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(manualKey, "Secret key copied!")}
                      className="text-xs text-black hover:underline cursor-pointer font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerifySetup} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-mono px-3 py-2 border border-gray-300 rounded focus:border-black focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setSetupModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={setupLoading}
                  className="bg-black hover:opacity-90 text-white px-5 py-2 rounded text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  {setupLoading ? "Verifying..." : "Verify & Activate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BACKUP CODES DISPLAY */}
      {showBackupCodesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-1">
              Save Your Recovery Backup Codes
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              If you lose access to your phone or authenticator app, these single-use codes are the <strong>only way</strong> to regain access to your account. Store them securely (e.g. password manager).
            </p>

            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              {newBackupCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="font-mono text-center text-xs py-1.5 px-2 bg-white rounded border border-gray-200 text-gray-800 tracking-wider"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    newBackupCodes.join("\n"),
                    "All backup codes copied to clipboard!"
                  )
                }
                className="w-full border border-gray-300 hover:bg-gray-50 py-2 rounded text-xs font-medium text-gray-700 cursor-pointer"
              >
                Copy All Codes
              </button>
              <button
                type="button"
                onClick={() => setShowBackupCodesModal(false)}
                className="w-full bg-black hover:opacity-90 text-white py-2 rounded text-xs font-medium cursor-pointer"
              >
                I Have Saved These Codes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DISABLE 2FA */}
      {disableModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Disable Two-Factor Authentication
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              To disable 2FA, please verify your current password or provide a 6-digit code.
            </p>

            <form onSubmit={handleDisable2FA} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Account Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your current password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-black focus:outline-none"
                />
              </div>

              <div className="text-center text-xs text-gray-400 font-medium my-1">OR</div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  className="w-full text-center tracking-widest font-mono px-3 py-2 border border-gray-300 rounded text-sm focus:border-black focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setDisableModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disableLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  {disableLoading ? "Disabling..." : "Disable 2FA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REGENERATE BACKUP CODES */}
      {regenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Regenerate Backup Codes
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter the 6-digit code from your authenticator app to generate a fresh set of recovery codes. Previous codes will be invalidated.
            </p>

            <form onSubmit={handleRegenerateBackupCodes} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="123456"
                  value={regenCode}
                  onChange={(e) => setRegenCode(e.target.value)}
                  className="w-full text-center tracking-widest font-mono px-3 py-2 border border-gray-300 rounded text-sm focus:border-black focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setRegenModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regenLoading}
                  className="bg-black hover:opacity-90 text-white px-4 py-2 rounded text-xs font-medium transition cursor-pointer disabled:opacity-50"
                >
                  {regenLoading ? "Generating..." : "Generate Codes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
