'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import styles from './reset.module.scss'

export default function Reset() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const router = useRouter()
    const supabase = createClientComponentClient()

    const resetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (password === confirmPassword) {
            const { data, error } = await supabase.auth.updateUser({ password })
            await supabase.auth.refreshSession();
            router.push('/')
        }
    }

    return (
        <div
            className={styles.container}>
            <div className={styles.formContainer}>
                <h4 className={styles.title}>Reset Password</h4>
                <form
                    onSubmit={resetPassword}
                    className={styles.form}
                >
                    <div className={styles.formField}>
                        <label className={styles.formLabel} htmlFor="password">
                            Password
                        </label>
                        <input
                            className={styles.formInput}
                            type="password"
                            name="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className={styles.formField}>
                        <label className={styles.formLabel} htmlFor="password">
                            Confirm Password
                        </label>
                        <input
                            className={styles.formInput}
                            type="password"
                            name="confirmPassword"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className={styles.formActions}>
                    <button type="submit" className={styles.formButton}>
                        Reset
                    </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
