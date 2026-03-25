const API_URL = '../backend/api';

document.addEventListener('DOMContentLoaded', async () => {
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', handleSignup);

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

async function handleSignup(event) {
    event.preventDefault();

    const message = document.getElementById('signupMessage');
    message.textContent = 'Creating your account...';
    message.className = 'form-message';

    const payload = {
        full_name: document.getElementById('fullName').value.trim(),
        email: document.getElementById('signupEmail').value.trim(),
        password: document.getElementById('signupPassword').value,
        confirm_password: document.getElementById('confirmPassword').value,
    };

    try {
        const response = await fetch(`${API_URL}/register.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!data.success) {
            message.textContent = data.error || 'Sign-up failed.';
            message.className = 'form-message error';
            return;
        }

        message.textContent = 'Account created. Redirecting...';
        message.className = 'form-message success';
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Sign-up failed:', error);
        message.textContent = 'Unable to reach the server.';
        message.className = 'form-message error';
    }
}
