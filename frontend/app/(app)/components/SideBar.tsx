"use client";

import Link from "next/link";
import { useState } from "react";

import "../../globals.css";
import "../../images.css"
import "./sidebar.css";

export default function SideBar() {
    const [authorsOpen, setAuthorsOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    return (
        <aside className="sidebar">
            <div className="books-sidebar">
                <Link href="/books">
                    <h2 className="btn-sidebar">KSIĄŻKI</h2>
                </Link>
                <button className="sidebar-title" onClick={() => setAuthorsOpen(!authorsOpen)}>
                    <h3>AUTOR {authorsOpen}</h3>
                </button>

                {authorsOpen && (
                    <div className="sidebar-list">
                        <p>fantastyka</p>
                        <p>przygodowe</p>
                        <p>komedia</p>
                    </div>
                )}

                <button className="sidebar-title" onClick={() => setCategoriesOpen(!categoriesOpen)}>
                    <h3>KATEGORIA {categoriesOpen}</h3>
                </button>

                {categoriesOpen && (
                    <div className="sidebar-list">
                        <p>fantastyka</p>
                        <p>przygodowe</p>
                        <p>komedia</p>
                    </div>
                )}

            </div>
            <div className="access-sidebar">
                <h2 className="btn-sidebar">DOSTĘPNOŚĆ</h2>
                
                <label className="switch">
                    <input type="checkbox" />
                    <span className="slider" />
                    <span className="label-text">
                        <h3>POKAŻ TYLKO DOSTĘPNE</h3>
                    </span>
                </label>
                
                <label className="switch">
                    <input type="checkbox" />
                    <span className="slider" />
                    <span className="label-text">
                        <h3>POKAŻ TYLKO NIEDOSTĘPNE</h3>
                    </span>
                </label>
            </div>
        </aside>
    )
}