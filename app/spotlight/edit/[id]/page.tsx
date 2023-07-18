"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import Nav from '../../../../components/dashboard/nav';
import { Input } from '../../../../components/input';
import styles from './edit.module.scss';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation';
import { useParams } from 'next/navigation';

function EditSpotlight() {
	const { id } = useParams();
	const [fileSizeWarning, setFileSizeWarning] = useState('');

	let file: File | null = null;

	function handleFiles(
		e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
	) {
		const files = (e.target as HTMLInputElement).files;
		file = files![0];
		// Check file size and set warning if it's too large
		if (file.size > 1572864) {
			setFileSizeWarning('File size exceeds 1.5MB. Please choose a smaller file.');
			file = null;
		} else {
			setFileSizeWarning('');
		}
	}

	const supabase = createClientComponentClient()
	
	async function handleImageUpload() {
		const datePrefix = Date.now();
		const fileName = `media/${datePrefix}-${file!.name}`;
		// Get signed key for file name in current directory.
		const response = await fetch(
			`/api/presignedurl?fileName=${fileName}`
		);

		const data = await response.json();
		const url = data.signedUrlObject.url;
		fetch(url, {
			method: "PUT",
			body: file,
		})
			.then((response) => {
				if (!response.ok) {
					return `Error uploading ${fileName}.`;
				}
			})
			.catch((err) => {
				return `Error uploading ${fileName}.`
			});
		return `${process.env.NEXT_PUBLIC_S3_URL}${fileName}`
	}

	const editSpotlight = async (formData: FormData) => {
		if(fileSizeWarning) {
			alert(fileSizeWarning);
			return;
		}
		let image = '';
		if(file){
			image = await handleImageUpload();
		}
		const name = String(formData.get("name"));
		const linkedin = String(formData.get("linkedin"));
		const twitter = String(formData.get("twitter"));
		const facebook = String(formData.get("facebook"));
		const youtube = String(formData.get("youtube"));
		const instagram = String(formData.get("linkedin"));
		const blurb = String(formData.get("blurb"));
		const portfolio = String(formData.get("portfolio"));
		const github = String(formData.get("github"));

		const { data, error } = await supabase
			.from("spotlight")
			.upsert({
				id,
				name,
				photo: image,
				linkedin,
				twitter,
				facebook,
				youtube,
				instagram,
				blurb,
				portfolio,
				github
			})
			.select();
		redirect("/dashboard");
	};
	return (
		<div className={styles.container}>
			<div>
				<Nav />
			</div>
			<form className={styles.rightCol} action={editSpotlight}>
				<div className={styles.back}>
					<Link href="/dashboard" passHref>
						<button className={styles.backButton}><FaChevronLeft /> Back </button>
					</Link>
				</div>
				<div className={styles.topInput}>
					<div className={styles.topInput}>
					<Input labelFor="name" labelText="Name">
						<input id="name" name="name" type="text" />
					</Input>
					<Input labelFor="featured-image" labelText="Featured Image">
						<input
							onChange={handleFiles}
							id="featured-image"
							type="file"
							accept="image/*"
						/>
					</Input>
					{fileSizeWarning && <p style={{ color: 'red' }}>{fileSizeWarning}</p>}
				</div>
				</div>
				<div className={styles.socialsContainer}>
					<Input labelFor="menteePortfolio" labelText="Portfolio">
						<input
							type="url"
							id="menteePortfolio"
							name="portfolio"
						/>
					</Input>
					<Input labelFor="menteeGithub" labelText="Github">
						<input
							type="url"
							id="menteeGithub"
							name="github"
						/>
					</Input>
					<Input labelFor="facebook" labelText="Facebook">
						<input
							type="url"
							id="facebook"
							name="facebook"
						/>
					</Input>
					<Input labelFor="instagram" labelText="Instagram">
						<input
							type="url"
							id="instagram"
							name="instagram"
						/>
					</Input>
					<Input labelFor="twitter" labelText="Twitter">
						<input
							type="url"
							id="twitter"
							name="twitter"
						/>
					</Input>
					<Input labelFor="linkedin" labelText="LinkedIn">
						<input
							type="url"
							id="linkedin"
							name="linkedin"
						/>
					</Input>
					<Input labelFor="youtube" labelText="YouTube">
						<input
							type="url"
							id="youtube"
							name="youtube"
						/>
					</Input>
				</div>
				<div className={styles.textArea}>
					<Input labelFor="menteeBlurb" labelText="Mentee Blurb">
						<textarea
							className={styles.menteeBlurb}
							name="blurb"
							rows={6}
							id="menteeBlurb"
						/>
					</Input>
				</div>
				<div className={styles.sendButton}>
					<input
						className={styles.button}
						type="submit"
						value="Send"
					/>
				</div>
			</form>
			<section className={styles.leftCol}>
				<p className={styles.instruction}>Instructions to upload mentee spotlight information.</p>
			</section>
		</div>
	);
}

export default EditSpotlight;
