import Link from "next/link";

import "@/styles/footer.css";

export default function Footer() {
    return (
        <footer className="footer">

            <div className="footer-column">
                <h3>KONTAKT</h3>

                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
            </div>

            <div className="footer-column">
                <h3>REGULAMIN</h3>

                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
            </div>

            <div className="footer-column">
                <h3>ZAMÓWIENIA</h3>

                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
            </div>

            <div className="footer-column">
                <h3>KALENDARZE</h3>

                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
                <Link href="/">xxxxxx</Link>
            </div>

        </footer>
    );
}