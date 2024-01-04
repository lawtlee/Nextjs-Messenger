'use client';

import  { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { BsGithub, BsGoogle } from 'react-icons/bs'
import { signIn, useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

import Input from "@/app/components/inputs/Inputs";
import Button from "@/app/components/Button";
import AuthSocialButton from "./AuthSocialButton";
import { useRouter } from "next/navigation";


type Variant = "LOGIN" | "REGISTER";

const AuthForm = () => {
    const [variant, setVariant] = useState<Variant>("LOGIN")
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const session = useSession();

    useEffect(()=>{
        if (session?.status === "authenticated"){
            router.push('/users');
        }
    },[session?.status])

    const toggleVariant = useCallback(()=>{
        if (variant === 'LOGIN')
            setVariant("REGISTER")
        else
            setVariant("LOGIN")
    },[variant])

    const {
        register,
        handleSubmit,
        formState:{
            errors
        }
    } = useForm<FieldValues>({
        defaultValues:{
            name: "",
            email: "",
            password: "",
        }
    })

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);
        if (variant === 'REGISTER'){
            axios.post('/api/register', data)
                .then(()=>signIn('credentials', data))
                .catch(()=>toast.error("Something went wrong!"))
                .finally(()=> setIsLoading(false))
        } else if (variant === "LOGIN"){
            signIn('credentials', {
                ...data, 
                redirect: false
            })
                .then((callback)=>{
                    if (callback?.error){
                        toast.error('Invalid credentials');
                    }

                    if (callback?.ok && !callback?.error){
                        toast.success("Logged in!");
                        router.push('/users');
                    }
                })
                .finally(()=>setIsLoading(false))
        }
    }

    const socialAction = (action: string) => {
        setIsLoading(true);
        
        signIn(action, { redirect: false })
            .then((callback)=>{
                if (callback?.error){
                    toast.error('Invalid credentials');
                }

                if (callback?.ok && !callback?.error){
                    toast.success("Logged in!");
                    router.push('/users');
                }
            })
            .finally(()=>setIsLoading(false))

    }

    return (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-5 py-8 shadow sm:rounded-lg sm:px-10">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {variant === 'REGISTER' && (
                        <Input 
                            id="name" 
                            label="Name" 
                            register={register}
                            errors={errors}
                            disabled={isLoading}
                        />
                    )}
                    <Input
                        errors={errors}
                        id="email"
                        label="Email address"
                        register={register}
                        type="email"
                        disabled={isLoading}
                    />
                    <Input
                        errors={errors}
                        id="password"
                        label="Password"
                        register={register}
                        type="password"
                        disabled={isLoading}
                    />
                    <div>
                        <Button
                            disabled={isLoading}
                            fullWidth
                            type="submit"
                        > 
                            {variant === 'LOGIN' ? "Sign in" : 'Register'} 
                        </Button>
                    </div>
                </form>
                <div className="mt-6">
                    <div className="relative">
                        <div className="
                            absolute
                            inset-0
                            flex
                            items-center"
                        >
                            <div className="
                                w-full
                                border-t
                                border-gray-300" 
                            >

                            </div>
                        </div>
                        <div className="
                            relative 
                            flex 
                            justify-center 
                            text-sm"
                        >
                            <span className="
                                bg-white px-2 
                                text-gray-500"
                            >
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="
                        mt-6 
                        flex 
                        gap-2"
                    >
                        <AuthSocialButton 
                            icon={BsGithub}
                            onClick={()=>socialAction('github')}
                        />
                        <AuthSocialButton
                            icon={BsGoogle}
                            onClick={()=>socialAction('google')}
                        />
                    </div>
                </div>

                <div className="
                    flex
                    gap-2
                    justify-center
                    text-sm
                    mt-6
                    px-2
                    text-gray-500
                ">
                    <div>
                        {variant === "LOGIN" ? "New to Messenger?" : "Already have an account?"}
                    </div>
                    <div
                        onClick={toggleVariant}
                        className="underline cursor-pointer"
                    >
                        {variant === 'LOGIN' ? "Create an Account" : "Login"}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthForm;