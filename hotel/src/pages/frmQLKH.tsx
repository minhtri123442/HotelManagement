import { useEffect, useState } from "react";

function CustomerList() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
  fetch("http://localhost:5134/api/customer")
    .then((res) => res.json())
    .then((data) => setCustomers(data))
    .catch((err) => console.error(err));
}, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Danh sách khách hàng</h2>

      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Mã KH</th>
            <th>Họ tên</th>
            <th>SĐT</th>
            <th>Email</th>
            <th>CCCD</th>
            <th>Giới tính</th>
            <th>Địa chỉ</th>
            <th>Ngày tạo</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c) => (
            <tr key={c.customerID}>
              <td>{c.customerCode}</td>
              <td>{c.fullName}</td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
              <td>{c.citizenID}</td>
              <td>{c.gender}</td>
              <td>{c.address}</td>
              <td>{new Date(c.createdDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerList;
