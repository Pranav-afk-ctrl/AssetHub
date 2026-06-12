import { NavLink, Route, Routes } from "react-router-dom";
import { AdminAssetsPage } from "./pages/admin/Assets";
import { AdminBookingsPage } from "./pages/admin/Bookings";

export default function App() {
  return (
    <div className="app">
      <nav className="nav">
        <strong>Asset Management</strong>
        <NavLink to="/admin/assets">Assets</NavLink>
        <NavLink to="/admin/bookings">Bookings</NavLink>
      </nav>

      <main className="main">
        <Routes>
          <Route path="/" element={<AdminAssetsPage />} />
          <Route path="/admin/assets" element={<AdminAssetsPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
