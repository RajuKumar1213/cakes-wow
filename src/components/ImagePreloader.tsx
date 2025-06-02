"use client";

import { useEffect } from "react";

const ImagePreloader = () => {
  useEffect(() => {
    // Preload critical images for instant display
    const criticalImages = [
      "/images/jungle.webp",
      "/images/engagement.webp", 
      "/images/aniversary3.webp",
      "/images/birthday.webp",
      "/images/heart.webp",
      "/images/chocolateloaded.webp",
      "/images/aniversary.webp",
      "/images/aniversary2.webp",
      "/images/designcake.webp",
    ];

    criticalImages.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      link.type = "image/webp";
      document.head.appendChild(link);
    });

    // Cleanup function to remove preload links
    return () => {
      criticalImages.forEach((src) => {
        const link = document.querySelector(`link[href="${src}"]`);
        if (link) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  return null; // This component doesn't render anything
};

export default ImagePreloader;
