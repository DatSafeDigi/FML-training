// ...existing code...

// Function to load menu into any page
function loadMenu() {
    fetch('/menu/menu.html')
        .then(response => response.text())
        .then(data => {
            // Create a container for the menu if it doesn't exist
            let menuContainer = document.getElementById('menuContainer');
            if (!menuContainer) {
                menuContainer = document.createElement('div');
                menuContainer.id = 'menuContainer';
                document.body.insertBefore(menuContainer, document.body.firstChild);
            }
            menuContainer.innerHTML = data;
            attachMenuEvents();
        })
        .catch(error => console.error('Error loading menu:', error));
}

// Load menu when DOM is ready
document.addEventListener('DOMContentLoaded', loadMenu);
