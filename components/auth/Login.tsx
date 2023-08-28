'use client'
import React, { useState } from 'react';
import styles from './login.module.scss';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthenticationSchema } from '@/lib/schema';

export function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()
    const supabase = createClientComponentClient()
    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        await supabase.auth.signInWithPassword({
            email,
            password,
        })
        router.push('/dashboard')
        router.refresh()
    }

    const resetPassword = async () => {
        const result = AuthenticationSchema.reset.safeParse({ email })

        if (result.success === false) {
        return { error: result.error.format() }
        }
        console.log(email)
        console.log('reset password')
        const {data, error} = await supabase.auth
            .resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/profile/reset`,
            })
            console.log(data, error)
    }

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h4 className={styles.title}>Login</h4>
                <form className={styles.form} onSubmit={handleSignIn}>
                    <div className={styles.formField}>
                        <input
                            className={styles.formInput}
                            type="email"
                            name="email"
                            id="email"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            placeholder="you@example.com"
                        />
                        <label className={styles.formLabel} htmlFor="email">Email</label>
                    </div>
                    <div className={styles.formField}>
                        <input
                            className={styles.formInput}
                            type="password"
                            name="password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            placeholder="••••••••"
                        />
                        <label className={styles.formLabel} htmlFor="password">Password</label>
                    </div>
                    <div className={styles.formActions}>
                        <span className={`${styles.passwordResetLink} ${styles.formButton}`} onClick={resetPassword}>Forgot Password?</span>
                        <button type="submit" className={styles.formButton}>Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}