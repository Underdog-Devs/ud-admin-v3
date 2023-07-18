import React from 'react';
import styles from './spotlight.module.scss';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaGithub } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
function Spotlight(props: any) {
	const { id, name, portfolio, facebook, twitter, instagram, linkedin, youtube, github, photo, blurb } = props.spotlight;
	return (
		<div className={styles.container}>
			<div>
				<div>
					{photo ? (
						<img
							className={styles.img}
							src={photo}
							alt="Featured"
							loading="lazy"
						/>
					) : (
						<Image className={styles.img} src="/images/fallback.png" width="64" height="80" alt={''} />
					)}
					<div>
						{name}
					</div>
				</div>
				<div className={styles.social}>
						{facebook && <div>
							<Link href={facebook}>
								<FaFacebookF />
							</Link>
						</div>}
						{twitter && <div>
							<Link href={twitter}>
								<FaTwitter />
							</Link>
						</div>}
						{instagram && <div>
							<Link href={instagram}>
								<FaInstagram />
							</Link>
						</div>}
						{linkedin && <div>
							<Link href={linkedin}>
								<FaLinkedinIn />
							</Link>
						</div>}
						{youtube && <div>
							<Link href={youtube}>
								<FaYoutube />
							</Link>
						</div>}
						{github && <div>
							<Link href={github}>
								<FaGithub />
							</Link>
						</div>}
					</div>
			</div>
			<div>
				<div className={styles.blurb}>
					{blurb}
				</div>
				<div className={styles.buttons}>
						<Link href={`/spotlight/edit/${id}`}>
							Edit
						</Link>
					<span>
						{portfolio && <div>
							<Link href={portfolio}>
								Portfolio
							</Link>
						</div>}
					</span>
					
				</div>
			</div>
		</div>
	);
}

export default Spotlight;
