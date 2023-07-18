import React from 'react';
import styles from './dashboard.module.scss';
import Nav from '../../components/dashboard/nav';
import PreviewPosts from '../../components/blog/previewPosts';
import { redirect } from 'next/navigation'
import {
	createServerComponentClient,
} from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

async function Dashboard() {
	const supabase = createServerComponentClient({ cookies })

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		// This route can only be accessed by authenticated users.
		// Unauthenticated users will be redirected to the `/login` route.
		redirect('/login')
	}

	const { data: posts, error } = await supabase.from('posts').select('*, authors(name)').limit(3)
	
	if (!error) {
		return (
			<div className={styles.container}>
				<div>
					<Nav />
				</div>
				<PreviewPosts
					posts={posts}
				/>
			</div>
		);
	}
}


export default Dashboard;
