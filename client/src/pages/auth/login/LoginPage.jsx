import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import twitter_ath from "../../../../public/twitter_auth.jpg";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import app from '../../context/firebase';
export default function LoginPage() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { mutate, isError, isLoading, error } = useMutation({
        mutationFn: async ({ username, password }) => {
            try {
                const res = await fetch(`${apiUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Something went wrong");
                }

                const data = await res.json();
                return data;
            } catch (error) {
                console.error(error);
                toast.error(error.message);
                throw error;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            navigate('/'); // Navigate to home on successful login
            toast.success('Logged In successfully');
        }
    });

    const { mutate: google, isLoading: googleLoading, isError: googleError } = useMutation({
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

                return data; // Return data to be handled in onSuccess
            } catch (error) {
                console.error("Could not connect with Google", error);
                toast.error("Google authentication failed.");
                throw error; // Re-throw the error for onError and React Query handling
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            navigate('/'); // Navigate to home on successful login
            toast.success('Logged In successfully');
        },
        onError: (error) => {
            console.error(error);
            toast.error(error.message || "Google authentication failed.");
        }
    });


    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        mutate(formData);
    };

    const handleGoogleSubmit = (e) => {
        e.preventDefault();
        google()
    }

    return (
        <div className='h-[100dvh] flex flex-row items-center justify-center w-full'>
            <div className='h-full border-r w-[50%] overflow-hidden object-cover hidden md:inline'>
                <img src={twitter_ath} alt="Twitter Authentication" className='object-cover w-full h-full' />
            </div>
            <div className='flex items-center flex-col justify-center w-[50%] h-full'>
                <h1 className='text-5xl mb-5 font-bold'>Let's Go.</h1>
                <form
                    className='w-full flex items-center flex-col gap-3'
                >
                    <label className="input input-bordered flex items-center gap-2 w-[80%] md:w-[70%]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-4 w-4 opacity-70">
                            <path
                                d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                        </svg>
                        <input
                            type="text"
                            className="grow"
                            placeholder="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label className="input input-bordered flex items-center gap-2 w-[80%] md:w-[70%]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-4 w-4 opacity-70">
                            <path
                                fillRule="evenodd"
                                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                                clipRule="evenodd" />
                        </svg>
                        <input
                            type="password"
                            className="grow"
                            placeholder='Password'
                            name='password'
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                    </label>
                    {/* <OAuth /> */}
                    <button onClick={handleGoogleSubmit} className='btn bg-green-500 hover:bg-green-400 w-[80%] md:w-[70%] text-white'>Google</button>
                    <button className='btn btn-neutral w-[80%] md:w-[70%] text-white' onClick={handleFormSubmit}>
                        {isLoading ? "Loading..." : "Submit"}
                    </button>
                    <div>
                        <p className='text-left'>
                            Don't have an account? <Link to="/signup" className='underline font-semibold'>SignUp</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
