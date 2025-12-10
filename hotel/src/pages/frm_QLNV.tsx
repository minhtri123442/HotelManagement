import React, { useState } from "react";
import "../styles/frm_QLNV.css";

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
}

const FrmQLNV: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: "Nguyễn Văn A", email: "vana@gmail.com", position: "Lễ Tân" },
    { id: 2, name: "Trần Thị B", email: "thib@gmail.com", position: "Quản Lý" },
    { id: 3, name: "Phạm Văn C", email: "vanc@gmail.com", position: "Bảo Vệ" },
    { id: 4, name: "Phạm Văn C", email: "vanc@gmail.com", position: "Bảo Vệ" },
    { id: 5, name: "Phạm Văn C", email: "vanc@gmail.com", position: "Bảo Vệ" },
    { id: 6, name: "Phạm Văn C", email: "vanc@gmail.com", position: "Bảo Vệ" },
    { id: 7, name: "Phạm Văn C", email: "vanc@gmail.com", position: "Bảo Vệ" },
  ]);

  const [form, setForm] = useState<Employee>({
    id: 0,
    name: "",
    email: "",
    position: "",
  });

  const [editMode, setEditMode] = useState<boolean>(false);

  // Thêm nhân viên
  const addEmployee = () => {
    const newEmp = { ...form, id: employees.length + 1 };
    setEmployees([...employees, newEmp]);
    resetForm();
  };

  // Sửa nhân viên
  const updateEmployee = () => {
    setEmployees(
      employees.map((emp) => (emp.id === form.id ? form : emp))
    );
    resetForm();
  };

  // Xóa nhân viên
  const deleteEmployee = (id: number) => {
    setEmployees(employees.filter((e) => e.id !== id));
  };

  // Chọn nhân viên để sửa
  const editEmployee = (emp: Employee) => {
    setForm(emp);
    setEditMode(true);
  };

  // Reset form
  const resetForm = () => {
    setForm({ id: 0, name: "", email: "", position: "" });
    setEditMode(false);
  };

  return (
    <div className="qlnv-container">
      <h2>QUẢN LÝ NHÂN VIÊN</h2>

      <div className="form-box">
        <input
          type="text"
          placeholder="Tên nhân viên"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="text"
          placeholder="Chức vụ"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
        />

        {editMode ? (
          <button className="btn edit" onClick={updateEmployee}>
            Cập nhật
          </button>
        ) : (
          <button className="btn add" onClick={addEmployee}>
            Thêm
          </button>
        )}

        <button className="btn reset" onClick={resetForm}>
          Reset
        </button>
      </div>

      {/* TABLE */}
      <table className="emp-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Chức vụ</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.position}</td>
              <td>
                <button className="btn small edit" onClick={() => editEmployee(emp)}>
                  Sửa
                </button>
                <button className="btn small delete" onClick={() => deleteEmployee(emp.id)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FrmQLNV;
