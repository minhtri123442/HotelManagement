import HotelsList from "../components/dashboardtrangchu"; 

import "../styles/HotelHome.css"; // chỉ chứa CSS slider

export default function HotelHome() {
 

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-10">

      

      {/* LIST HOTELS */}
      <section className="px-10 mt-4">
                                       
        <HotelsList />
      </section>
    </div>
  );
}
