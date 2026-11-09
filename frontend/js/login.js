document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const message = document.getElementById('message');
    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('password').value;

    message.textContent = 'Signing in...';
    message.className = '';

    // Customers use an email. Staff use a username.
    const isCustomer = identifier.includes('@');

    const endpoint = isCustomer
        ? '/api/customer/login'
        : '/api/auth/login';

    const body = isCustomer
        ? { email: identifier, password }
        : { username: identifier, password };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Invalid login credentials.');
        }

        // Clear any session belonging to the other account type.
        const otherLogout = isCustomer
            ? '/api/auth/logout'
            : '/api/customer/logout';

        await fetch(otherLogout, {
            method: 'POST',
            credentials: 'same-origin'
        });

        // Redirect based on the authenticated account's role.
        if (data.user.role === 'Customer') {
            window.location.replace('/customer-dashboard.html');
        } else {
            window.location.replace('/index.html');
        }

    } catch (error) {
        message.textContent = error.message;
        message.className = 'notice error';
    }
});
