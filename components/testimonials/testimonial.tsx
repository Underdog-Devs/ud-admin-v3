import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "./testimonial.module.scss";
function Testimonial(props: any) {
  // const { post } = props;
  // function truncateString(postTitle: string) {
  // 	if (postTitle.length > 70) {
  // 		postTitle = `${postTitle.slice(0, 70)}...`;
  // 	}
  // 	return postTitle;
  // }
  const { name, testimonial, type, image } = props.testimonial;
  if (!props.testimonial) {
    return <div className={styles.container}>Loading</div>;
  }
  return (
    <div className={styles.container}>
      <div>
        {image ? (
          <img
            className={styles.img}
            src={image}
            alt="Featured"
            loading="lazy"
          />
        ) : (
          <Image
            className={styles.img}
            src="/images/fallback.png"
            width="64"
            height="80"
            alt={""}
          />
        )}
      </div>
      <div className={styles.author}>
        <span className={styles.name}>
          {name}{" "}
          <span className={styles.type}>
            {" - "} {type}
          </span>
        </span>
      </div>
      <div className={styles.testimonial}>{testimonial}</div>
      <span>
        <Link href={`/testimonials/edit/${props.testimonial.id}`}>
          Edit Testimonial
        </Link>
      </span>
    </div>
  );
}

export default Testimonial;
