"use client";
import React, { useEffect, useState } from 'react';
import type { Spotlight } from "@/app/types/spotlight";
import InfiniteScroll from 'react-infinite-scroller';
import styles from './spotlightContainer.module.scss';
import { default as SpotlightComponent } from './spotlight';

interface SpotlightProps {
    initialSpotlight: Spotlight[];
};

export const SpotlightContainer = ({ initialSpotlight }: SpotlightProps) => {
    const [screenWidth, setScreenWidth] = useState<number>(0);
    const fetching = React.useRef(false);
    const [pages, setPages] = React.useState(initialSpotlight);
    const spotlight = pages.flatMap((page) => page);
    const [pageNumber, setPageNumber] = React.useState(6);
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
        if (!fetching.current) {
            try {
                fetching.current = true;
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_HOSTNAME}/api/spotlight?page=${pageNumber}`
                );
                const data = await response.json();
                setPageNumber(pages.length + data.spotlight.length);
                setPages((prev) => [...prev, ...data.spotlight]);
                if (data.spotlight.length === 0) {
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
            className={styles.items}
        >

            {spotlight.map((s) => (
                <SpotlightComponent spotlight={s} key={s.id} />
            ))}
        </InfiniteScroll>

    );
};
