"use client";
import React, { useEffect, useState } from 'react';
import type { Testimonial } from "@/app/types/testimonials";
import InfiniteScroll from 'react-infinite-scroller';
import styles from './testimonials.module.scss';
import { default as TestimonialComponent } from './testimonial';

interface TestimonialsProps {
    initialTestimonials: Testimonial[];
};

export const Testimonials = ({ initialTestimonials }: TestimonialsProps) => {
    const [screenWidth, setScreenWidth] = useState<number>(0);
    const fetching = React.useRef(false);
    const [pages, setPages] = React.useState(initialTestimonials);
    const testimonials = pages.flatMap((page) => page);
    const [currentPage, setCurrentPage] = React.useState(6);
    const [hasMore, setHasMore] = React.useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                setScreenWidth(window.innerWidth);
            };

            window.addEventListener('resize', handleResize);

            // Initial screen width
            setScreenWidth(window.innerWidth);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);


    const loadMore = async () => {
        const nextPage = currentPage + 6;
        if (!fetching.current) {
            try {
                fetching.current = true;

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_HOSTNAME}/api/testimonials?page=${currentPage}`
                );
                const data = await response.json();
                setCurrentPage(pages.length + data.testimonials.length);
                setPages((prev) => [...prev, ...data.testimonials]);
                if (data.testimonials.length === 0) {
                    setHasMore(false);
                }
            } finally {
                fetching.current = false;
            }
        }
    };

    return (
        <InfiniteScroll
            hasMore={hasMore}
            pageStart={0}
            loadMore={loadMore}
            loader={
                <span key={0} className="loader">
                    Loading ...
                </span>
            }
            element="div"
            className={styles.container}
        >

            {testimonials.map((testimonial) => (
                <TestimonialComponent testimonial={testimonial} key={testimonial.id} />
            ))}
        </InfiniteScroll>

    );
};
