import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/shared/Navbar";
import { Footer } from "../../components/shared/Footer";

export default function EmployerLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
