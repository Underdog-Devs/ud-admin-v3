import { z } from 'zod'

const nonEmptyString = z.string().refine(value => value !== "", {
    message: "Field is required"
});

const maxCharMessage = (n: number) => `Should not be more than ${n} characters`;
const minCharMessage = (n: number) => `Should be at least ${n} characters`;

const stringMax = (n: number) => z.string().refine(value => value.length <= n, {
    message: maxCharMessage(n)
});

const stringMin = (n: number) => z.string().refine(value => value.length >= n, {
    message: minCharMessage(n)
});

export const PostBlogSchema = z.object({
    title: stringMin(4).and(stringMax(240)).and(nonEmptyString),
    entry: nonEmptyString,
});


const emailValidation = nonEmptyString.and(
    z.string().email({
        message: "Invalid email address",
    })
);



const stringLengthRange = (min: number, max: number) => 
    nonEmptyString
    .refine(value => value.length >= min, { message: minCharMessage(min) })
    .refine(value => value.length <= max, { message: maxCharMessage(max) });

const passwordValidation = stringLengthRange(8, 128);

const signUpValidation = z
    .object({
        email: emailValidation,
        password: passwordValidation,
        confirmPassword: passwordValidation,
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const passwordResetValidation = z
    .object({
        password: passwordValidation,
        confirmPassword: passwordValidation,
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const AuthenticationSchema = {
    signIn: z.object({
        email: emailValidation,
    }),
    signUp: signUpValidation,
    passwordReset: passwordResetValidation
};