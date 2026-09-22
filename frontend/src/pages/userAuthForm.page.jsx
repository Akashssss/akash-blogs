import React, { useContext, useState } from 'react';
import google from '../imgs/google.png';
import InputBox from '../components/input.component';
import { Link, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import AnimationWrapper from '../common/page-animation';
import { storeInSession } from '../common/session';
import { UserContext } from '../App';
import { authWithGoogle } from '../common/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

export default function UserAuthForm({ type }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { userAuth: { access_token }, setUserAuth } = useContext(UserContext);

    const userAuthThroughServer = async (serverRoute, formData) => {
        setIsSubmitting(true);
        try {
            const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData);
            storeInSession("user", JSON.stringify(data));
            setUserAuth(data);
            toast.success(type === "sign-in" ? "Welcome back!" : "Account created successfully!");
        } catch ({ response }) {
            toast.error(response?.data?.error || "Authentication failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const serverRoute = type === "sign-in" ? "/signin" : "/signup";

    const handleSubmit = (e) => {
        e.preventDefault();
        const formElement = document.getElementById("regForm");
        const form = new FormData(formElement);
        const formData = Object.fromEntries(form);

        const { fullname, email, password } = formData;

        if (type === "sign-up") {
            if (!fullname || fullname.trim().length < 3) {
                return toast.error('Full name must be at least 3 letters long');
            }
        }
        if (!email || !email.trim().length) {
            return toast.error('Email address is required');
        }
        if (!emailRegex.test(email)) {
            return toast.error('Please provide a valid email address');
        }
        if (!password || !password.trim().length) {
            return toast.error('Password is required');
        }
        if (!passwordRegex.test(password)) {
            return toast.error('Password must be 6-20 characters with at least 1 uppercase letter, 1 lowercase letter, and 1 number');
        }

        userAuthThroughServer(serverRoute, formData);
    };

    const handleGoogleAuth = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const user = await authWithGoogle();
            const idToken = await user.getIdToken();
            const formData = { access_token: idToken };
            userAuthThroughServer("/google-auth", formData);
        } catch (error) {
            setIsSubmitting(false);
            toast.error("Trouble logging in through Google.");
            console.error(error);
        }
    };

    return access_token ? (
        <Navigate to='/' />
    ) : (
        <AnimationWrapper keyValue={type}>
            <section className='h-cover flex justify-center items-center py-10 px-4'>
                <Toaster />
                <Card className="w-full max-w-[420px] shadow-xl border border-border bg-card text-card-foreground rounded-3xl p-4 sm:p-6">
                    <CardHeader className="text-center space-y-2 pb-6 px-2">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-purple/15 flex items-center justify-center text-purple mb-1">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-2xl sm:text-3xl font-bold font-inter tracking-tight text-card-foreground">
                            {type === "sign-in" ? "Welcome back" : "Create an account"}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                            {type === "sign-in"
                                ? "Enter your credentials to access your stories and analytics"
                                : "Join thousands of writers and readers around the world"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-2">
                        <form id="regForm" onSubmit={handleSubmit} className="flex flex-col">
                            {type === 'sign-up' && (
                                <InputBox
                                    label="Full Name"
                                    type="text"
                                    name="fullname"
                                    placeholder="Jane Doe"
                                    icon="user"
                                />
                            )}

                            <InputBox
                                label="Email Address"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                icon="envelope"
                            />

                            <InputBox
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                icon="key"
                            />

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-11 text-sm font-semibold rounded-xl bg-purple hover:bg-purple/90 text-white transition-all shadow-md mt-2"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Authenticating...
                                    </span>
                                ) : (
                                    type === "sign-in" ? "Sign In" : "Get Started"
                                )}
                            </Button>

                            <div className="relative my-6 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <span className="relative bg-card px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleAuth}
                                disabled={isSubmitting}
                                className="w-full h-11 rounded-xl border border-border hover:bg-muted font-medium text-sm flex items-center justify-center gap-3 transition-colors text-card-foreground"
                            >
                                <img src={google} alt="Google" className="w-4 h-4 object-contain shrink-0" />
                                <span>Continue with Google</span>
                            </Button>

                            <div className="text-center pt-4">
                                {type === 'sign-in' ? (
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Don't have an account?{' '}
                                        <Link to='/signup' className='font-semibold text-purple hover:underline ml-1'>
                                            Sign up now
                                        </Link>
                                    </p>
                                ) : (
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Already have an account?{' '}
                                        <Link to='/signin' className='font-semibold text-purple hover:underline ml-1'>
                                            Sign in here
                                        </Link>
                                    </p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </section>
        </AnimationWrapper>
    );
}
