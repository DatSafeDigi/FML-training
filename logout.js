document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị tên người dùng từ localStorage
    const username = localStorage.getItem('username');
    if (username) {
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.textContent = username;
        }
    }

    // Xử lý sự kiện logout cho tất cả các nút logout
    const logoutButtons = document.querySelectorAll('#logout');
    logoutButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Xóa thông tin đăng nhập
            localStorage.removeItem('userRole');
            localStorage.removeItem('employeeName');
            localStorage.removeItem('employeeId');
            localStorage.removeItem('username');
            localStorage.removeItem('token');
            
            // Chuyển hướng về trang đăng nhập
            window.location.href = '../login/login.html';
        });
    });
});
