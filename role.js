document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    const currentPath = window.location.pathname;

    if (!user) {
        alert('Vui lòng đăng nhập để tiếp tục.');
        window.location.href = '../login/login.html';
        return;
    }

    // Kiểm tra quyền truy cập dựa vào đường dẫn
    if (currentPath.includes('/admin/') && user.role !== 'admin') {
        alert('Bạn không có quyền truy cập trang này.');
        window.location.href = '../user/dashboard.html';
        return;
    }

    if (currentPath.includes('/user/') && user.role !== 'user') {
        alert('Bạn không có quyền truy cập trang này.');
        window.location.href = '../admin/dashboard.html';
        return;
    }
});
