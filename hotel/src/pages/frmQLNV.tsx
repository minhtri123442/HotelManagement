import { useState } from "react";
import { FaEdit, FaSearch } from "react-icons/fa";

export default function EmployeeManagement() {
  const [searchText, setSearchText] = useState("");

  const [employees] = useState([
    {
      EmployeeID: 1,
      EmployeeCode: "EMP001",
      FullName: "Nguyễn Văn A",
      Phone: "0901122334",
      Email: "vana@example.com",
      CitizenID: "079112233445",
      Gender: "Nam",
      Address: "123 Lê Lợi, Quận 1",
      CreatedDate: "2024-12-01"
    },
    {
      EmployeeID: 2,
      EmployeeCode: "EMP002",
      FullName: "Trần Thị B",
      Phone: "0912233445",
      Email: "thib@example.com",
      CitizenID: "079556677889",
      Gender: "Nữ",
      Address: "45 Nguyễn Huệ, Quận 1",
      CreatedDate: "2024-12-02"
    },
    {
      EmployeeID: 3,
      EmployeeCode: "EMP003",
      FullName: "Lê Hoàng C",
      Phone: "0933344556",
      Email: "hoangc@example.com",
      CitizenID: "084112233990",
      Gender: "Nam",
      Address: "12 Pasteur, Quận 3",
      CreatedDate: "2024-12-03"
    },
    {
      EmployeeID: 4,
      EmployeeCode: "EMP004",
      FullName: "Phạm Thu D",
      Phone: "0984455667",
      Email: "thud@example.com",
      CitizenID: "093998877665",
      Gender: "Nữ",
      Address: "99 CMT8, Quận 10",
      CreatedDate: "2024-12-04"
    },
    {
      EmployeeID: 5,
      EmployeeCode: "EMP005",
      FullName: "Võ Minh E",
      Phone: "0975566778",
      Email: "minhe@example.com",
      CitizenID: "072667788551",
      Gender: "Nam",
      Address: "54 Điện Biên Phủ",
      CreatedDate: "2024-12-05"
    }
  ]);

  // lọc theo tìm kiếm
  const filtered = employees.filter((e) =>
    e.FullName.toLowerCase().includes(searchText.toLowerCase())
  );

//   const handleDelete = (id) => {
//     setEmployees(employees.filter((e) => e.EmployeeID !== id));
//   };

  return (
    <div className="w-full h-full p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Quản lý nhân viên</h1>

      {/* Thanh tìm kiếm */}
      <div className="flex items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="Nhập tên nhân viên..."
          className="border p-2 rounded w-64"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <FaSearch /> Tìm kiếm
        </button>
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white p-5 rounded-xl shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-100 text-left text-black">
              <th className="p-3">Mã NV</th>
              <th className="p-3">Tên nhân viên</th>
              <th className="p-3">SĐT</th>
              <th className="p-3">Email</th>
              <th className="p-3">CCCD</th>
              <th className="p-3">Giới tính</th>
              <th className="p-3">Địa chỉ</th>
              <th className="p-3">Ngày tạo</th>
              <th className="p-3 text-center">Chức năng</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((e) => (
              <tr key={e.EmployeeID} className="border-b hover:bg-gray-50 text-black">
                <td className="p-3">{e.EmployeeCode}</td>
                <td className="p-3">{e.FullName}</td>
                <td className="p-3">{e.Phone}</td>
                <td className="p-3">{e.Email}</td>
                <td className="p-3">{e.CitizenID}</td>
                <td className="p-3">{e.Gender}</td>
                <td className="p-3">{e.Address}</td>
                <td className="p-3">{e.CreatedDate}</td>

                <td className="p-3 flex gap-3 justify-center">
                  <button className="text-blue-600 hover:text-blue-800">
                    <FaEdit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
