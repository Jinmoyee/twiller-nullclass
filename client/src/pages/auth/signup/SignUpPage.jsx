import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import twitter_ath from "../../../../public/twitter_auth.jpg";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import app from '../../context/firebase';

export default function SignUpPage() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        fullName: '',
        password: ''
    });

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Signup Mutation for manual signup
    const { mutate, isError, isPending, error } = useMutation({
        mutationFn: async ({ email, username, fullName, password }) => {
            try {
                const res = await fetch(`${apiUrl}/api/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, username, fullName, password })
                });
                const data = await res.json();

                if (data.error) {
                    throw new Error(data.error);
                }
                toast.success('Account created successfully');
                return data;
            } catch (error) {
                console.error(error);
                toast.error(error.message);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            navigate('/'); // Redirect after successful signup
        }
    });

    // Google Signup Mutation
    const { mutate: googleSignup, isLoading: googleLoading, isError: googleError } = useMutation({
        mutationFn: async () => {
            try {
                const provider = new GoogleAuthProvider();
                const auth = getAuth(app);
                const result = await signInWithPopup(auth, provider);

                const res = await fetch(`${apiUrl}/api/auth/google`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: result.user.displayName,
                        photo: result.user.photoURL,
                        email: result.user.email,
                    })
                });

                const data = await res.json();
                if (data.error) {
                    throw new Error(data.error);
                }

                return data;
            } catch (error) {
                console.error("Google signup failed", error);
                toast.error("Google signup failed.");
                throw error;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            navigate('/'); // Redirect after successful Google signup
            toast.success('Signed up successfully with Google');
        },
        onError: (error) => {
            console.error(error);
            toast.error(error.message || "Google signup failed.");
        }
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutate(formData);
    };

    const handleGoogleSignup = (e) => {
        e.preventDefault();
        googleSignup();
    };

    return (
        <div className='h-[100dvh] flex flex-row items-center justify-around w-full'>
            <div className='h-full border-r w-[50%] overflow-hidden object-cover hidden md:inline'>
                <img src={twitter_ath} alt="" className='object-cover w-full h-full' />
            </div>
            <div className='flex items-center flex-col justify-center w-[50%] h-full'>
                <h1 className='text-5xl mb-5 font-bold'>Join Today.</h1>
                <form className='w-full flex items-center flex-col gap-3' onSubmit={handleSubmit}>
                    <label className="input input-bordered flex items-center gap-2 w-[80%] md:w-[70%]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70">
                            <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                            <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                        </svg>
                        <input type="email" className="grow" placeholder="Email" name="email" value={formData.email} onChange={handleInputChange} />
                    </label>
                    <label className="input input-bordered flex items-center gap-2 w-[80%] md:w-[70%]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                        </svg>
                        <input type="text" className="grow" placeholder="Username" name="username" value={formData.username} onChange={handleInputChange} />
                    </label>
                    <label className="input input-bordered flex items-center gap-2 w-[80%] md:w-[70%]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                        </svg>
                        <input type="text" className="grow" placeholder="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                    </label>
                    <label className="input input-bordered flex items-center gap-2 w-[80%] md:w-[70%]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-70">
                            <path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" />
                        </svg>
                        <input type="password" className="grow" placeholder='Password' name='password' value={formData.password} onChange={handleInputChange} />
                    </label>

                    <button onClick={handleGoogleSignup} className='btn bg-green-500 w-[80%] md:w-[70%] text-white hover:bg-green-400'>
                        {googleLoading ? "Loading..." : "Sign Up with Google"}
                    </button>

                    <button className='btn btn-neutral w-[80%] md:w-[70%] text-white'>
                        {isPending ? "Loading..." : "Sign Up"}
                    </button>
                </form>
                <div className='mt-4'>
                    <span>Already have an account? </span>
                    <Link to="/login" className='text-blue-500'>Log in</Link>
                </div>
            </div>
        </div>
    );
}
