"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './details.module.scss';

interface Props {
  id: string;
  date: string;
  author?: string;
}

function Details(props: Props) {
	const { id, date, author } = props;
	const [deleteMessage, setDeleteMessage] = useState(false);
	const [deleteSuccess, setDeleteSuccess] = useState(false);

	const deletePost = async () => {
		//try {
		//	const res = await axios.post('/api/blog/delete', {
		//		id,
		//	});
		//	setDeleteSuccess(true);
		//	console.log(res);
		//} catch (error) {
		//	console.error(error);
		//}
	};

	const toggleDeleteMessage = () => {
		setDeleteMessage(!deleteMessage);
	};

	const fullDate = new Date(date);
	const month = fullDate.getUTCMonth() + 1;
	const day = fullDate.getUTCDate();
	const year = fullDate.getUTCFullYear();
	const parsedDate = `${month}/${day}/${year}`;
	return (
		deleteSuccess ? <div style={{ color: 'red', fontSize: 14 }}>Post Deleted</div> : (
			<div className={styles.container}>
				<ul>
					{deleteMessage ? (
						<div className={styles.deleteContainer}>
							<li>Are you sure?</li>
							<div>
								<li onClick={deletePost}>
									Yes
								</li>
								<li onClick={toggleDeleteMessage}>
									No
								</li>
							</div>
						</div>
					) : (
						<li onClick={toggleDeleteMessage}>
							Delete
						</li>
					)}
					<li>
						<Link href={`/blog/edit/${id}`}>
							Edit
						</Link>
					</li>
					{author
					&& (
						<li>
							<span>
								Written by <span>{author}</span>
							</span>
						</li>
					)}
					<li>
						<span>
							Posted on <span>{parsedDate}</span>
						</span>
					</li>
				</ul>
			</div>
		)
	);
}

export default Details;
