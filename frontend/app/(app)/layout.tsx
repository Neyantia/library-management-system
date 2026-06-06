import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import "@/styles/globals.css";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-wrapper">
      <NavBar />
      
      <main className="app-content">
        {children}
      </main>

      <Footer />
    </div>
  );
}
