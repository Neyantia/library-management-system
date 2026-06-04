"use client";

import Link from "next/link";
import { useState } from "react";
import SideBar from "./SideBar";
import "../../globals.css";
import "../../images.css"
import "./navbar.css";
import "./sidebar.css";

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
                        <h1>MoonBook &#x1F319;</h1>
                    </Link>
                    <input className="search" placeholder="Szukaj..."/>
                    <span><i className="fa fa-search"></i></span>
                </div>

                <div className="navbar-row bottom-row">
                    <button className="btn">
                        <Link href="/books" className="nav-link">
                            <h3>Książki</h3>
                        </Link>
                    </button>

                    <button className="btn">
                        <Link href="/faq" className="nav-link">
                            <h3>FAQ</h3>
                        </Link>
                    </button>
                </div>
            </nav>
            {isSideBarOpen && <SideBar />}
        </>
    );
}