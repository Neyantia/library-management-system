"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import SideBar from "./SideBar";

import "../styles/navbar.css";
import "../styles/sidebar.css";

export default function NavBar() {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);

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
                    <input className="search" placeholder="Szukaj..."/>
                    <span><i className="fa fa-search"></i></span>
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