import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import "@/styles/globals.css";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      
      <div className="app-layout">
        <main>{children}</main>
      </div>

      <Footer />
    </>
  );
}
