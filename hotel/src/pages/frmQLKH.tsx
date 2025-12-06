import { useState } from "react";


export default function CustomerManagement() {
  const [customers] = useState([
    {
      CustomerID: 1,
      CustomerCode: "CUS001",
      FullName: "Nguyễn Văn A",
      Phone: "0901234567",
      Email: "nguyenvana@example.com",
      CitizenID: "079123456789",
      Gender: "Nam",
      Address: "123 Lê Lợi, Quận 1, TP.HCM",
      CreatedDate: "2024-12-01"
    },
    {
      CustomerID: 2,
      CustomerCode: "CUS002",
      FullName: "Trần Thị B",
      Phone: "0912345678",
      Email: "tranthib@example.com",
      CitizenID: "079987654321",
      Gender: "Nữ",
      Address: "45 Nguyễn Huệ, Quận 1, TP.HCM",
      CreatedDate: "2024-12-02"
    },
    {
      CustomerID: 3,
      CustomerCode: "CUS003",
      FullName: "Lê Hoàng C",
      Phone: "0934567890",
      Email: "lehoangc@example.com",
      CitizenID: "084112233445",
      Gender: "Nam",
      Address: "12 Pasteur, Quận 3, TP.HCM",
      CreatedDate: "2024-12-03"
    },
    {
      CustomerID: 4,
      CustomerCode: "CUS004",
      FullName: "Phạm Thu D",
      Phone: "0987654321",
      Email: "phamthud@example.com",
      CitizenID: "093556677889",
      Gender: "Nữ",
      Address: "99 CMT8, Quận 10, TP.HCM",
      CreatedDate: "2024-12-04"
    },
    {
      CustomerID: 5,
      CustomerCode: "CUS005",
      FullName: "Võ Minh E",
      Phone: "0971122334",
      Email: "vominhe@example.com",
      CitizenID: "072667788990",
      Gender: "Nam",
      Address: "54 Điện Biên Phủ, Bình Thạnh, TP.HCM",
      CreatedDate: "2024-12-05"
    },
    {
      CustomerID: 6,
      CustomerCode: "CUS006",
      FullName: "Đặng Ngọc F",
      Phone: "0968887776",
      Email: "dangngocf@example.com",
      CitizenID: "079334455667",
      Gender: "Nữ",
      Address: "70 Võ Thị Sáu, Quận 3, TP.HCM",
      CreatedDate: "2024-12-06"
    },
    {
      CustomerID: 7,
      CustomerCode: "CUS007",
      FullName: "Huỳnh Gia G",
      Phone: "0945566778",
      Email: "huynhgiag@example.com",
      CitizenID: "071221133445",
      Gender: "Nam",
      Address: "22 Quang Trung, Gò Vấp, TP.HCM",
      CreatedDate: "2024-12-07"
    }
  ]);

  return (
    <div className="w-full h-full p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Quản lý khách hàng</h1>

      {/* Bảng danh sách khách */}
      <div className="bg-white p-5 rounded-xl shadow my-5">
        <table className="w-full border-collapse my-1">
          <thead>
            <tr className="bg-blue-100 text-left text-black">
              <th className="p-3">Mã KH</th>
              <th className="p-3">Tên khách</th>
              <th className="p-3">SĐT</th>
              <th className="p-3">Email</th>
              <th className="p-3">CCCD</th>
              <th className="p-3">Giới tính</th>
              <th className="p-3">Địa chỉ</th>
              <th className="p-3">Ngày tạo</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c.CustomerID} className="border-b hover:bg-gray-50 text-black">
                <td className="p-3">{c.CustomerCode}</td>
                <td className="p-3">{c.FullName}</td>
                <td className="p-3">{c.Phone}</td>
                <td className="p-3">{c.Email}</td>
                <td className="p-3">{c.CitizenID}</td>
                <td className="p-3">{c.Gender}</td>
                <td className="p-3">{c.Address}</td>
                <td className="p-3">{c.CreatedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

