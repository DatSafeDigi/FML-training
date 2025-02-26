// Lấy dữ liệu từ AppScript (chỉ chứa link prefill)
function fetchTestLinks() {
    return fetch('https://script.google.com/macros/s/AKfycbxVE91TVIm750_JO8V3twHS3oqr8xonhvPq44JJFwZS7Oc37FpGLJSZd_M_yTkMld26cA/exec')  // URL của AppScript đã triển khai
        .then(response => response.json())
        .then(data => data);
}

// Hàm lấy employeeId và employeeName từ sessionStorage hoặc localStorage
function getEmployeeInfo() {
    const employeeId = sessionStorage.getItem('employeeId') || localStorage.getItem('employeeId');
    const employeeName = sessionStorage.getItem('employeeName') || localStorage.getItem('employeeName');
    
    if (!employeeId || !employeeName) {
        alert('Không thể tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.');
        window.location.href = 'login.html';
        return null;
    }
    
    return { employeeId, employeeName };
}

// Cập nhật bảng bài kiểm tra
function populateTestTable() {
    fetchTestLinks().then(testLinks => {
        const testTableBody = document.querySelector('#test-table tbody');
        testLinks.forEach(test => {
            const row = document.createElement('tr');
            
            // Tạo ô tên môn học
            const courseCell = document.createElement('td');
            courseCell.textContent = test.course;
            row.appendChild(courseCell);
            
            // Tạo nút "Làm bài" và gán chức năng tự động điền
            const actionCell = document.createElement('td');
            const testButton = document.createElement('button');
            testButton.textContent = 'Thực hiện';
            testButton.onclick = function() {
                // Gọi hàm để nối thông tin và mở form
                fillAndSubmitForm(test.formLink);
            };
            actionCell.appendChild(testButton);
            row.appendChild(actionCell);
            
            testTableBody.appendChild(row);
        });
    });
}

// Khi người dùng nhấn vào nút "Thực hiện"
function fillAndSubmitForm(formLink) {
    const employeeInfo = getEmployeeInfo();
    if (!employeeInfo) return;

    const userName = employeeInfo.employeeName;
    const employeeCode = employeeInfo.employeeId;

    // Tạo URL object để parse form link
    let url = new URL(formLink);
    
    // Lấy field ID từ URL parameters
    let nameFieldId = '';
    let employeeFieldId = '';
    
    // Duyệt qua tất cả parameters để tìm field ID
    for (let [key, value] of url.searchParams.entries()) {
        if (value === '') {  // Tìm parameter có giá trị rỗng
            if (key.startsWith('entry.')) {
                if (!nameFieldId) {
                    nameFieldId = key;
                } else if (!employeeFieldId) {
                    employeeFieldId = key;
                }
            }
        }
    }

    // Xóa giá trị cũ nếu có
    url.searchParams.delete(nameFieldId);
    url.searchParams.delete(employeeFieldId);
    
    // Thêm giá trị mới
    url.searchParams.append(nameFieldId, userName);
    url.searchParams.append(employeeFieldId, employeeCode);

    // Mở form với link đã được cập nhật
    window.open(url.toString(), '_blank');
}

// Gọi hàm khi tải trang
window.onload = populateTestTable;
