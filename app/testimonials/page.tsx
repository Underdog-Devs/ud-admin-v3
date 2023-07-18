import { Testimonials } from "@/components/testimonials/testimonials";
import type { Testimonial } from "@/app/types/testimonials";
import styles from "./index.module.scss";
import {
      createServerComponentClient,
      } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from "next/navigation";
import Nav from "@/components/dashboard/nav";

async function fetchTestimonials(): Promise<Testimonial[]> {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOSTNAME}/api/testimonials`);
      const data = await response.json();
      return data.testimonials;
}

export default async function TestimonialsPage() {  
      const supabase = createServerComponentClient({ cookies })

      const {
            data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
            redirect('/login')
      }

      const testimonials = await fetchTestimonials();
      return (
      <div className={styles.container}>
		<div>
			<Nav />
		</div>
		<div className={styles.main}>
                  <Testimonials initialTestimonials={testimonials}/>
		</div>
	</div>)
}
