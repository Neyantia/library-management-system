"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import SideBar from "./SideBar";
import { useRouter } from "next/navigation";

import "../styles/navbar.css";
import "../styles/sidebar.css";

export default function NavBar() {
    const router = useRouter();

    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        const query = searchTerm.trim();

        if (!query) {
            router.push("/books");
            return;
        }

        router.push(`/books?search=${encodeURIComponent(query)}`);
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-row top-row">
                    <button className="menu-button"
                        type="button"
                        onClick={() => setIsSideBarOpen((prev) => !prev)}
                        >
                        &#9776;
                    </button>
                    <Link href="/main" className="logo">
                        <div className="logo-content">
                            <h1>MoonBook</h1>

                            <Image src={"/moon_img.svg"}
                                alt="MoonBook logo"
                                width={35}
                                height={35}
                            />
                        </div>
                    </Link>
                    <input className="search" 
                        placeholder="Szukaj..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearch();
                            }
                        }}
                        />
                    <button className="search-button"
                        type="button"
                        onClick={handleSearch}
                        style={{color: "var(--dark-purple)", marginRight: "10px"}}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                </div>

                <div className="navbar-row bottom-row">
                    <button className="nav-btn">
                        <Link href="/books" className="nav-link">
                            <h3>Książki</h3>
                        </Link>
                    </button>

                    <button className="nav-btn">
                        <Link href="/faq" className="nav-link">
                            <h3>FAQ</h3>
                        </Link>
                    </button>
                </div>
            </nav>
            {isSideBarOpen && (
                <SideBar
                    isSideBarOpen={isSideBarOpen}
                    setIsSideBarOpen={setIsSideBarOpen}
                />
            )}
        </>
    );
}