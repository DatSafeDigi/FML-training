// Xử lý sự kiện cho menu hamburger
function attachMenuEvents() {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('menu');
    const logoutButton = document.getElementById('logout');
    const usernameElement = document.querySelector('.username');

    // Kiểm tra sự tồn tại của các phần tử
    if (!hamburger || !menu) {
        console.error('Required menu elements not found');
        return;
    }

    // Display username
    const username = localStorage.getItem('employeeName') || localStorage.getItem('username');
    if (usernameElement && username) {
        usernameElement.textContent = username;
    }

    // Clean up existing event listeners
    const toggleMenu = (event) => {
        event.stopPropagation();
        hamburger.classList.toggle('active');
        if (!menu.classList.contains('show')) {
            menu.style.display = 'block';
            setTimeout(() => menu.classList.add('show'), 10);
        } else {
            menu.classList.remove('show');
            setTimeout(() => menu.style.display = 'none', 300); // Match animation duration
        }
    };

    // Xử lý click hamburger
    hamburger.addEventListener('click', toggleMenu);

    // Xử lý click outside
    document.addEventListener('click', (event) => {
        if (menu.classList.contains('show') && 
            !menu.contains(event.target) && 
            !hamburger.contains(event.target)) {
            toggleMenu(event);
        }
    });

    // Xử lý phím ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu.classList.contains('show')) {
            toggleMenu(event);
        }
    });

    // Prevent menu close when clicking inside
    menu.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    // Logout handler
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = '../../login/login.html';
        });
    }

    // Thêm xử lý click cho menu items
    menu.querySelectorAll('a:not(#logout)').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                try {
                    window.location.href = href;
                } catch (error) {
                    console.error('Navigation error:', error);
                    alert('Có lỗi khi chuyển trang!');
                }
            }
        });
    });

    highlightCurrentPage();
}

// Initialize menu events
document.addEventListener('DOMContentLoaded', attachMenuEvents);

// Reattach events when needed (for dynamic content)
function reinitializeMenu() {
    attachMenuEvents();
}

// Thêm kiểm tra link hiện tại chính xác hơn
function highlightCurrentPage() {
    const currentPath = window.location.pathname.toLowerCase();
    const menuItems = document.querySelectorAll('.menu a');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href.toLowerCase())) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}
