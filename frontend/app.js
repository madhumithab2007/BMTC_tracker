// Initialize map
let map;
let markers = [];

// API URL
const API_URL = 'http://localhost/bmtc-bus-tracker/backend/api';

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Center map on Bangalore
    map = L.map('map').setView([12.9716, 77.5946], 12);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Load buses
    loadBuses();
    
    // Auto-refresh every 10 seconds
    setInterval(loadBuses, 10000);
    
    // Set up feedback form
    document.getElementById('feedbackForm').addEventListener('submit', submitFeedback);
});

// Load all active buses
async function loadBuses() {
    try {
        const response = await fetch(`${API_URL}/get_buses.php`);
        const data = await response.json();
        
        if (data.success) {
            updateBusList(data.buses);
            updateMapMarkers(data.buses);
        } else {
            console.error('Failed to load buses:', data.message);
        }
    } catch (error) {
        console.error('Error loading buses:', error);
    }
}

// Update bus list
function updateBusList(buses) {
    const container = document.getElementById('busListContainer');
    
    if (!buses || buses.length === 0) {
        container.innerHTML = '<p>No active buses found</p>';
        return;
    }
    
    container.innerHTML = buses.map(bus => `
        <div class="bus-item" onclick="focusOnBus(${bus.latitude}, ${bus.longitude}, '${bus.bus_number}')">
            <div class="bus-number">🚌 Bus ${bus.bus_number}</div>
            <div class="bus-route">${bus.route_name || 'No route assigned'}</div>
            <small>Updated: ${bus.last_updated ? new Date(bus.last_updated).toLocaleTimeString() : 'N/A'}</small>
        </div>
    `).join('');
}

// Update map markers
function updateMapMarkers(buses) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    buses.forEach(bus => {
        if (bus.latitude && bus.longitude) {
            const marker = L.marker([parseFloat(bus.latitude), parseFloat(bus.longitude)]).addTo(map);
            marker.bindPopup(`
                <strong>Bus ${bus.bus_number}</strong><br>
                Route: ${bus.route_name || 'N/A'}<br>
                Status: ${bus.status}<br>
                Speed: ${bus.speed || 'N/A'} km/h
            `);
            markers.push(marker);
        }
    });
}

// Focus on a bus
function focusOnBus(lat, lng, busNumber) {
    if (lat && lng) {
        map.setView([parseFloat(lat), parseFloat(lng)], 15);
    }
}

// Search buses
function searchBus() {
    const searchTerm = document.getElementById('searchBus').value.toLowerCase();
    const busItems = document.querySelectorAll('.bus-item');
    
    busItems.forEach(item => {
        const busNumber = item.querySelector('.bus-number').textContent.toLowerCase();
        if (busNumber.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Submit feedback
async function submitFeedback(event) {
    event.preventDefault();
    
    const feedbackData = {
        user_name: document.getElementById('userName').value,
        bus_number: document.getElementById('busNumber').value,
        rating: parseInt(document.getElementById('rating').value),
        comment: document.getElementById('comment').value
    };
    
    try {
        const response = await fetch(`${API_URL}/submit_feedback.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedbackData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Thank you for your feedback!');
            document.getElementById('feedbackForm').reset();
        } else {
            alert('Error: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting feedback');
    }
}