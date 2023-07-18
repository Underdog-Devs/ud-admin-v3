
'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import Nav from '@/components/dashboard/nav';
import { Input } from '@/components/input';
import styles from './edit.module.scss';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from "next/navigation";
import { useParams } from 'next/navigation';

async function EditTestimonial() {
	const { id } = useParams();
	const supabase = createClientComponentClient()
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

	async function handleSubmit(formData: FormData) {
		if(fileSizeWarning) {
			alert(fileSizeWarning);
			return;
		}
		let image = '';
		if(file){
			image = await handleImageUpload();
		}

		const name = String(formData.get("name"));
		const testimonial = String(formData.get("testimonial"));
		const type = String(formData.get("type"));

		const { data, error } = await supabase
			.from("testimonials")
			.upsert({
                id,
				name,
				testimonial,
				image,
				type
			})
			.select();

		redirect("/dashboard");
	}

	return (
		<div className={styles.container}>
			<div>
				<Nav />
			</div>
			<form className={styles.rightCol} action={handleSubmit}>
				<div className={styles.back}>
					<Link href="/dashboard">
						<button className={styles.backButton}>
							<FaChevronLeft /> Back{' '}
						</button>
					</Link>
				</div>
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

				<Input labelFor="type" labelText="Choose Type">
					<select name="type" id="type">
						<option value="mentee">mentee testimonial</option>
						<option value="mentor">mentor testimonial</option>
					</select>
				</Input>
				<Input labelFor="testimonialText" labelText="Testimonial Text">
					<textarea
						className={styles.testimonialText}
						name="testimonial"
						rows={6}
						id="testimonial"
					/>
				</Input>
				<div className={styles.sendButton}>
					<button type="submit">Submit</button>
				</div>
			</form>

			<section className={styles.leftCol}>
				<p className={styles.instruction}>Instructions to upload mentee spotlight information.</p>
			</section>
		</div>
	);
}

export default EditTestimonial;
