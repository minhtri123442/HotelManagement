import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/mainlayout";
import CustomerManagement from "./pages/frmQLKH";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Layout chứa sidebar + nội dung */}
        <Route path="/" element={<Layout />}>
          
          {/* Trang con */}
          <Route path="customers" element={<CustomerManagement />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
