import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ items }) => {
    return (
        <nav className="flex items-center text-sm font-medium text-gray-500 my-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && (
                            <svg
                                className="w-5 h-5 text-gray-400 mx-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                        {item.link ? (
                            <Link to={item.link} className="hover:text-blue-600 transition-colors">
                                {item.label}
                            </Link>
                        ) : (
                            <span className={`${index === items.length - 1 ? "text-gray-900 font-semibold" : ""}`}>
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
