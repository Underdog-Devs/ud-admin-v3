import React from 'react';
import styles from './input.module.scss';

type Props = {
	labelFor: string;
	labelText: string;
	children: any;
	required?: boolean;
}

export function Input(props: Props) {
	const { labelFor, labelText, required, children } = props;
	return (
		<div className={styles.input}>
			<label className={styles.labels} htmlFor={labelFor}>{required&&<span className={styles.required}>*</span>}{labelText}
			</label>
			{children}
		</div>
	);
}
