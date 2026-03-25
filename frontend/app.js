let map;
let markers = [];
let refreshTimer;

const API_URL = '../backend/api';

document.addEventListener('DOMContentLoaded', async () => {
    const session = await ensureAuthenticated();
    if (!session) {
        return;
    }

    document.getElementById('userWelcome').textContent = `Signed in as ${session.user.full_name}`;
    document.getElementById('feedbackForm').addEventListener('submit', submitFeedback);
    document.getElementById('logoutButton').addEventListener('click', logout);

    initializeMap();
    await loadBuses();
    refreshTimer = setInterval(loadBuses, 10000);
});

async function ensureAuthenticated() {
    try {
        const response = await fetch(`${API_URL}/session.php`, {
            credentials: 'include',
        });
        const data = await response.json();

        if (!data.authenticated) {
            window.location.href = 'login.html';
            return null;
        }

        return data;
    } catch (error) {
        console.error('Session check failed:', error);
        window.location.href = 'login.html';
        return null;
    }
}

function initializeMap() {
    map = L.map('map').setView([12.9716, 77.5946], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
}

async function loadBuses() {
    try {
        const response = await fetch(`${API_URL}/get_buses.php`, {
            credentials: 'include',
        });
        const data = await response.json();

        if (!data.success) {
            console.error('Failed to load buses:', data.error || data.message);
            return;
        }

        updateBusList(data.buses);
        updateMapMarkers(data.buses);
        document.getElementById('busCountLabel').textContent = `${data.count} active buses are connected to the live tracker.`;
    } catch (error) {
        console.error('Error loading buses:', error);
        document.getElementById('busListContainer').innerHTML = '<p>Unable to load bus data right now.</p>';
    }
}

function updateBusList(buses) {
    const container = document.getElementById('busListContainer');

    if (!buses || buses.length === 0) {
        container.innerHTML = '<p>No active buses found.</p>';
        return;
    }

    container.innerHTML = buses.map((bus) => `
        <div class="bus-item" onclick="focusOnBus(${bus.latitude ?? 'null'}, ${bus.longitude ?? 'null'})">
            <div class="bus-number">Bus ${escapeHtml(bus.bus_number)}</div>
            <div class="bus-route">${escapeHtml(bus.route_name || 'No route assigned')}</div>
            <small>${escapeHtml(formatBusMeta(bus))}</small>
        </div>
    `).join('');
}

function updateMapMarkers(buses) {
    markers.forEach((marker) => map.removeLayer(marker));
    markers = [];

    buses.forEach((bus) => {
        if (!bus.latitude || !bus.longitude) {
            return;
        }

        const marker = L.marker([parseFloat(bus.latitude), parseFloat(bus.longitude)]).addTo(map);
        marker.bindPopup(`
            <strong>Bus ${escapeHtml(bus.bus_number)}</strong><br>
            Route: ${escapeHtml(bus.route_name || 'N/A')}<br>
            Driver: ${escapeHtml(bus.driver_name || 'N/A')}<br>
            Status: ${escapeHtml(bus.status)}<br>
            Speed: ${escapeHtml(bus.speed || 'N/A')} km/h
        `);
        markers.push(marker);
    });
}

function focusOnBus(lat, lng) {
    if (!lat || !lng) {
        return;
    }

    map.setView([parseFloat(lat), parseFloat(lng)], 15);
}

function searchBus() {
    const searchTerm = document.getElementById('searchBus').value.trim().toLowerCase();
    const busItems = document.querySelectorAll('.bus-item');

    busItems.forEach((item) => {
        const busNumber = item.querySelector('.bus-number').textContent.toLowerCase();
        item.style.display = busNumber.includes(searchTerm) ? 'block' : 'none';
    });
}

async function submitFeedback(event) {
    event.preventDefault();

    const feedbackData = {
        bus_number: document.getElementById('busNumber').value.trim(),
        rating: parseInt(document.getElementById('rating').value, 10),
        comment: document.getElementById('comment').value.trim(),
    };

    try {
        const response = await fetch(`${API_URL}/submit_feedback.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackData),
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.error || 'Unable to submit feedback.');
            return;
        }

        alert('Thank you for your feedback!');
        document.getElementById('feedbackForm').reset();
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Error submitting feedback.');
    }
}

async function logout() {
    try {
        await fetch(`${API_URL}/logout.php`, {
            method: 'POST',
            credentials: 'include',
        });
    } finally {
        if (refreshTimer) {
            clearInterval(refreshTimer);
        }
        window.location.href = 'login.html';
    }
}

function formatBusMeta(bus) {
    const updated = bus.last_updated ? new Date(bus.last_updated).toLocaleTimeString() : 'No timestamp';
    return `${bus.source || 'Unknown source'} to ${bus.destination || 'Unknown destination'} | Updated: ${updated}`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
