'use client';

import React, { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, completeFirstLogin, type LoginState } from './actions';

const initialState: LoginState = {
    error: '',
    success: false,
    redirectUrl: ''
};

const Login = () => {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(login, initialState);
    const [showResetModal, setShowResetModal] = React.useState(false);
    const [resetSuccess, setResetSuccess] = React.useState(false);
    const [isNavigating, setIsNavigating] = React.useState(false);

    const [showPassword, setShowPassword] = React.useState(false);

    const isLoading = isPending || isNavigating;

    useEffect(() => {
        if (state.success && state.redirectUrl) {
            setIsNavigating(true);
            router.push(state.redirectUrl);
        }
        if (state.resetRequired) {
            setShowResetModal(true);
        }
    }, [state, router]);

    return (
        <div className="font-display bg-login-background-light dark:bg-login-background-dark min-h-screen flex items-center justify-center p-4">
            {/* Main Container */}
            <div className="w-full max-w-md">
                {/* Recessed Login Card */}
                <div className="relative bg-white dark:bg-login-surface-dark rounded-md shadow-login-recessed overflow-hidden border border-gray-200 dark:border-gray-800 p-8 md:p-10">
                    {/* Tech Pattern Overlay (Subtle decoration) */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-login-primary to-transparent opacity-70"></div>
                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-10 text-center">
                        {/* Logo / Icon */}
                        <div className="mb-4 p-3 bg-gray-100 dark:bg-[#16181d] rounded-full border border-gray-200 dark:border-gray-700 shadow-inner">
                            <span className="material-symbols-outlined text-login-primary text-3xl">hub</span>
                        </div>
                        <h1 className="text-gray-900 dark:text-white tracking-tight text-2xl font-bold mb-1">opsbee-workhub</h1>
                        <p className="text-login-primary text-xs font-medium tracking-[0.2em] uppercase">Identity Verification</p>
                    </div>
                    {/* Success Message */}
                    {resetSuccess && (
                        <div className="mb-6 p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm font-medium text-center animate-in fade-in slide-in-from-top-2">
                            Password set successfully. Please login with your new credentials.
                        </div>
                    )}
                    {/* Error Message */}
                    {state.error && !resetSuccess && (
                        <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium text-center animate-pulse">
                            {state.error}
                        </div>
                    )}
                    {/* Login Form */}
                    <form className="flex flex-col gap-5" action={formAction}>
                        {/* Email Field with Suffix */}
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-700 dark:text-login-text-main text-sm font-medium leading-normal flex items-center gap-2" htmlFor="email">
                                <span className="material-symbols-outlined text-[16px] text-login-primary">alternate_email</span>
                                Work Email
                            </label>
                            <div className="relative group flex items-center bg-gray-50 dark:bg-[#16181d] rounded-md border border-gray-300 dark:border-gray-700 focus-within:border-login-primary focus-within:ring-1 focus-within:ring-login-primary focus-within:shadow-login-glow transition-all duration-200 overflow-hidden">
                                <input
                                    className="form-input flex-1 bg-transparent border-none text-gray-900 dark:text-white h-12 px-4 text-sm font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-0"
                                    id="email"
                                    name="email"
                                    placeholder="username"
                                    type="text"
                                    defaultValue=""
                                    required
                                    autoComplete="off"
                                />
                                <div className="px-4 h-full flex items-center bg-gray-100 dark:bg-[#1f2229] border-l border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm font-medium select-none">
                                    @opsbeetech.com
                                </div>
                            </div>
                        </div>
                        {/* Password Field */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-gray-700 dark:text-login-text-main text-sm font-medium leading-normal flex items-center gap-2" htmlFor="password">
                                    <span className="material-symbols-outlined text-[16px] text-login-primary">key</span>
                                    Password
                                </label>
                            </div>
                            <div className="relative group">
                                <input
                                    className="form-input flex w-full rounded-md text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#16181d] focus:border-login-primary focus:ring-1 focus:ring-login-primary focus:shadow-login-glow h-12 px-4 pr-12 text-sm font-medium transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 tracking-widest"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    type={showPassword ? "text" : "password"}
                                    defaultValue=""
                                    required
                                />
                                {/* Eye Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-login-primary transition-colors focus:outline-none"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>
                        {/* Action Button */}
                        <div className="pt-2">
                            <button disabled={isLoading} className="group relative w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-md h-12 bg-login-primary hover:bg-[#05d1e4] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_10px_rgba(6,228,249,0.2)] hover:shadow-[0_0_20px_rgba(6,228,249,0.4)]" type="submit">
                                {/* Decorative angled line on button */}
                                <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.3)_50%,transparent_55%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out"></div>
                                <span className="relative text-[#102223] text-sm font-bold tracking-wider uppercase flex items-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <span className="size-4 border-2 border-[#102223]/30 border-t-[#102223] rounded-full animate-spin"></span>
                                            {isNavigating ? 'Redirecting...' : 'Authenticating...'}
                                        </>
                                    ) : (
                                        <>
                                            Login
                                            <span className="material-symbols-outlined text-lg">login</span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </form>
                    {/* Security Footer inside card for containment */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/50 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-semibold">
                            <span className="flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                            </span>
                            System Operational
                        </div>
                    </div>
                </div>
                {/* Outside Footer Info */}
                <div className="mt-6 flex justify-center gap-6 text-xs text-gray-400 dark:text-gray-600 font-medium">
                    <button className="hover:text-login-primary transition-colors">Help</button>
                    <button className="hover:text-login-primary transition-colors">Privacy</button>
                    <button className="hover:text-login-primary transition-colors">Terms</button>
                </div>
            </div>

            {/* Password Reset Modal */}
            {showResetModal && state.userId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
                                    <span className="material-symbols-outlined text-2xl">lock_reset</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Setup Your Password</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    To secure your account, please set a new personal password before continuing.
                                </p>
                            </div>

                            <form action={async (formData) => {
                                const result = await completeFirstLogin(state.userId!, formData);
                                if (result.success) {
                                    setShowResetModal(false);
                                    setResetSuccess(true);
                                    // Clean URL params if any
                                } else {
                                    alert(result.error);
                                }
                            }} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">New Password</label>
                                    <input name="newPassword" type="password" placeholder="••••••••" required minLength={6} className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#252b36] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-login-primary outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Confirm Password</label>
                                    <input name="confirmPassword" type="password" placeholder="••••••••" required minLength={6} className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#252b36] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-login-primary outline-none transition-all" />
                                </div>
                                <button type="submit" className="mt-2 w-full py-3 px-4 bg-login-primary hover:bg-[#05d1e4] text-[#102223] font-bold rounded-lg transition-colors shadow-lg shadow-login-primary/20">
                                    Set Password & Return to Login
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default Login;
