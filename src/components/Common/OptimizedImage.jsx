import React, { useState } from 'react';

/**
 * OptimizedImage Component
 * Automatically routes images through a free Cloudflare-backed CDN (wsrv.nl)
 * Provides automatic WebP compression, resizing, and lazy-loading
 */
export const OptimizedImage = ({
    src,
    alt = 'Image',
    className = '',
    width,
    height,
    quality = 80,
    fit = 'cover',
    fallbackSrc = 'https://via.placeholder.com/300x300?text=No+Image',
    ...rest
}) => {
    const [error, setError] = useState(false);

    // If there is no src or it's a local static asset (starting with /), return standard img
    if (!src) {
        return <img src={fallbackSrc} alt={alt} className={className} {...rest} />;
    }

    if (src.startsWith('/') && !src.startsWith('//')) {
        return <img src={src} alt={alt} className={className} loading="lazy" {...rest} />;
    }

    // Construct wsrv.nl CDN URL
    let optimizedUrl = src;

    if (src.startsWith('http')) {
        optimizedUrl = `https://wsrv.nl/?url=${encodeURIComponent(src)}&output=webp&q=${quality}`;
        if (width) optimizedUrl += `&w=${width}`;
        if (height) optimizedUrl += `&h=${height}`;
        optimizedUrl += `&fit=${fit}`;
    }

    return (
        <img
            src={error ? fallbackSrc : optimizedUrl}
            alt={alt}
            className={className}
            loading="lazy"
            onError={() => setError(true)}
            {...rest}
        />
    );
};
