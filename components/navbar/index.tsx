"use client";
import LogoutButton from '../auth/LogoutButton'
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';
import styles from './navBar.module.scss';

function NavBar({ user }: any) {
	const [showLinks, setShowLinks] = useState(false);
	const linksContainerRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (showLinks) {
			if (linksContainerRef.current) {
				linksContainerRef.current.style.height = 'auto';
			}
		} else if (linksContainerRef.current) {
			linksContainerRef.current.style.height = '0px';
		}
	}, [showLinks]);

	const toggleLinks = () => {
		setShowLinks(!showLinks);
	};

	return (
		<div className={styles.container}>
			<div className={styles.desktopNav}>
				<Link href="/dashboard" passHref>
					<img
						onClick={() => setShowLinks(false)}
						className={styles.image}
						src="/images/underdogdevs-01.png"
						height={175}
						width={175}
						alt="Underdog devs"
					/>
				</Link>
				<nav className={styles.navigation}>
					<div className={styles.navigationLinks}>
						{user ? (
							<div className="flex items-center gap-4">
								<div>{user.email}</div>
								<LogoutButton />
							</div>
						) : (
							<Link
								href="/login"
								className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
							>
								Login
							</Link>
						)}
					</div>
				</nav>
			</div>
			<div className={styles.mobileNav}>
				<div className={styles.navHeader}>
					<Link href="/" passHref>
						<img
							onClick={() => setShowLinks(false)}
							className={styles.image}
							src="/images/icon-01.png"
							height={75}
							width={75}
							alt="Underdog devs"
						/>
					</Link>
					<button
						aria-label="navigation-menu"
						className={styles.navToggle}
						onClick={toggleLinks}
					>
						{showLinks ? <FaTimes /> : <FaBars />}
					</button>
				</div>
				<nav className={styles.mobileNavigation} ref={linksContainerRef}>
					{user ? (
						<div className={styles.navBlog}>
							<span>Blog</span>
							<Link href="/blog/create" passHref>
								Create
							</Link>
							<Link href="/blog" passHref>
								View All
							</Link>
						</div>
					) : null}
					<div className={styles.navAccount}>
						<span>Account</span>
						{user ? (<p>Sign Out</p>) : (
							<Link href="/" passHref>
								Sign In
							</Link>
						)}
					</div>
				</nav>
			</div>
		</div>
	);
}

export default NavBar;
