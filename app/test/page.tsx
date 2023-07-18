"use client";
import { useState } from "react";
import ImageUpload from "@/components/common/imageUpload";


export default async function TestimonialsPage() {
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    function handleImageUrls(urls: string[]) {
        setImageUrls(urls);
    }

    return (
        <div>
            <ImageUpload onImageUpload={handleImageUrls} />
            {imageUrls.map(url => <img src={url} alt="uploaded" />)}
        </div>
    );
}
