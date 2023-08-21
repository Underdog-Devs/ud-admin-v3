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
