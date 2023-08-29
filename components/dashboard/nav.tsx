import Link from 'next/link';
import React from 'react';
import styles from './nav.module.scss';

function Nav() {
	return (
		<ul className={styles.list}>
			<div>
				<h4>Blog</h4>
				<li>
					<Link href="/blog/create">Create</Link>
				</li>
				<li>
					<Link href="/blog/">View All</Link>
				</li>
			</div>
			{/* <div>
				<h4>Spotlight</h4>
				<li>
					<Link href="/spotlight/create">Create</Link>
				</li>
				<li>
					<Link href="/spotlight/">View All</Link>
				</li>
			</div>
			<div>
				<h4>Testimonials</h4>
				<li>
					<Link href="/testimonials/create">Create</Link>
				</li>
				<li>
					<Link href="/testimonials/">View All</Link>
				</li>
			</div>  */}
		</ul>
	);
}

export default Nav;
