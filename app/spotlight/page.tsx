import { SpotlightContainer } from "@/components/spotlight/spotlightContainer";
import type { Spotlight } from "@/app/types/spotlight";
import {
	createServerComponentClient,
} from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Nav from "@/components/dashboard/nav";
import styles from "./index.module.scss";

async function fetchSpotlights(): Promise<Spotlight[]> {
	const response = await fetch(`${process.env.NEXT_PUBLIC_HOSTNAME}/api/spotlight`);
	const data = await response.json();
	return data.spotlight;
}

export default async function SpotlightsPage() {
	const supabase = createServerComponentClient({ cookies })

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/login')
	}
	const spotlight = await fetchSpotlights();
	return <div className={styles.container}>
		<div>
			<Nav />
		</div>
		<div className={styles.main}>
			<SpotlightContainer initialSpotlight={spotlight} />
		</div>
	</div>
}
