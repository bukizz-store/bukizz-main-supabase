import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const SeoProvider = ({ children }) => {
    return (
        <HelmetProvider>
            <Helmet>
                <title>Bukizz - School Essentials Delivered</title>
                <meta name="description" content="Bukizz is your one-stop shop for school essentials, uniforms, stationeries and more. Order online for fast delivery." />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Bukizz - School Essentials Delivered" />
                <meta property="og:description" content="Bukizz is your one-stop shop for school essentials, uniforms, stationeries and more. Order online for fast delivery." />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>
            {children}
        </HelmetProvider>
    );
};

export default SeoProvider;
