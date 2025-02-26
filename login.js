document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');
    const togglePassword = document.querySelector('.toggle-password');
    const loginButton = document.getElementById('login-button');
    const loginError = document.getElementById('login-error');

    // Constants
    const API_URL = 'https://script.google.com/macros/s/AKfycbwXNgp1XsvB9_-8HhWw3P6TURKN1_O1ZDWSGJEu3d0onLXu-Ds7-7WUqfFpy6UPN5w0/exec';
    const TIMEOUT_DURATION = 15000; // 15 seconds

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Handle input validation
    function validateInput(input) {
        const value = input.value.trim();
        const field = input.closest('.input-field');
        
        if (!value) {
            field.classList.add('error');
            return false;
        }
        field.classList.remove('error');
        return true;
    }

    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('input', () => validateInput(input));
        input.addEventListener('blur', () => validateInput(input));
    });

    // Show error message
    function showError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
        setTimeout(() => {
            loginError.style.display = 'none';
        }, 5000);
    }

    // Set loading state
    function setLoading(isLoading) {
        loginButton.classList.toggle('loading', isLoading);
        loginButton.disabled = isLoading;
        usernameInput.disabled = isLoading;
        passwordInput.disabled = isLoading;
    }

    // Handle login
    async function handleLogin(username, password) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

            const response = await fetch(`${API_URL}?action=getAccountData`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data?.accounts?.length) {
                throw new Error('Invalid server response');
            }

            const account = data.accounts.find(acc => 
                acc.account === username && 
                acc.pass.toString() === password
            );

            if (account) {
                const userInfo = {
                    role: account.role,
                    name: account.name,
                    id: account.account
                };

                // Store user info
                localStorage.setItem('user', JSON.stringify(userInfo));
                
                // Remember user if checked
                if (document.getElementById('remember').checked) {
                    localStorage.setItem('rememberedUser', username);
                } else {
                    localStorage.removeItem('rememberedUser');
                }

                // Redirect
                window.location.href = '../index.html';
            } else {
                throw new Error('Invalid credentials');
            }

        } catch (error) {
            console.error('Login error:', error);
            
            if (error.name === 'AbortError') {
                showError('Request timeout. Please try again.');
            } else if (!navigator.onLine) {
                showError('No internet connection');
            } else if (error.message === 'Invalid credentials') {
                showError('Invalid username or password');
            } else {
                showError('An error occurred. Please try again later.');
            }
        }
    }

    // Form submit handler
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Validate inputs
        const isUsernameValid = validateInput(usernameInput);
        const isPasswordValid = validateInput(passwordInput);

        if (!isUsernameValid || !isPasswordValid) {
            showError('Please fill in all fields');
            return;
        }

        setLoading(true);
        loginError.style.display = 'none';

        try {
            await handleLogin(username, password);
        } finally {
            setLoading(false);
        }
    });

    // Restore remembered username
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        usernameInput.value = rememberedUser;
        document.getElementById('remember').checked = true;
    }
});