const API_URL = '../backend/api';

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);

    try {
        const response = await fetch(`${API_URL}/session.php`, {
            credentials: 'include',
        });
        const data = await response.json();

        if (data.authenticated) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Unable to verify session:', error);
    }
});

async function handleLogin(event) {
    event.preventDefault();

    const message = document.getElementById('loginMessage');
    message.textContent = 'Signing you in...';
    message.className = 'form-message';

    const payload = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
    };

    try {
        const response = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!data.success) {
            message.textContent = data.error || 'Login failed.';
            message.className = 'form-message error';
            return;
        }

        message.textContent = 'Login successful. Redirecting...';
        message.className = 'form-message success';
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login failed:', error);
        message.textContent = 'Unable to reach the server.';
        message.className = 'form-message error';
    }
}
