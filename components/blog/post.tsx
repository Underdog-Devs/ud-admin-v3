import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Details from './details';
import styles from './post.module.scss';

function Post(props: any) {
	const { post } = props;
	function truncateString(postTitle: string) {
		if (postTitle.length > 70) {
			postTitle = `${postTitle.slice(0, 70)}...`;
		}
		return postTitle;
	}

	return (
		<div className={styles.container}>
			<div>
				{post.image ? (
					<img
						className={styles.img}
						src={post.image}
						alt="Featured"
						loading="lazy"
					/>
				) : (
					<Image src="/images/fallback.png" width="64" height="80" alt={''} />
				)}
			</div>
			<div>
			<h3><Link href={`/blog/${post.title.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\s-]/g, '')}/${post.id}`}>
					{truncateString(post.title)}
				</Link></h3>
				{post.first_paragraph}
				<Details id={post.id} date={post.created_at} />
			</div>
		</div>
	);
}

export default Post;
