import Link from "next/link";

import styles from "./LoggedOutNav.module.scss";

export function LoggedOutNav() {
  return (
    <div className={styles.container}>
      <Link href="/dashboard" passHref>
        <img
          className={styles.image}
          src="/images/underdogdevs-01.png"
          height={175}
          width={175}
          alt="Underdog devs"
        />
      </Link>

      <Link href="/login" className={styles.link}>
        Login
      </Link>
    </div>
  );
}
