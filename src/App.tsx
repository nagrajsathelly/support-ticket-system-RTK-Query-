
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TicketList from "./components/TicketList";
import TicketDetails from "./pages/TicketDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TicketList />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
