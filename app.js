// Lost Phones database (using localStorage)
class LostPhoneTracker {
    constructor() {
        this.phones = this.loadPhones();
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.renderPhones();
    }

    attachEventListeners() {
        const form = document.getElementById('phoneForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const phone = {
            id: Date.now(),
            ownerName: document.getElementById('ownerName').value,
            phoneModel: document.getElementById('phoneModel').value,
            color: document.getElementById('color').value,
            lostDate: document.getElementById('lostDate').value,
            location: document.getElementById('location').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            email: document.getElementById('email').value,
            description: document.getElementById('description').value,
            reportedAt: new Date().toLocaleDateString()
        };

        this.addPhone(phone);
        this.renderPhones();
        document.getElementById('phoneForm').reset();
        this.showNotification('Phone reported successfully!');
    }

    addPhone(phone) {
        this.phones.unshift(phone);
        this.savePhones();
    }

    removePhone(id) {
        this.phones = this.phones.filter(phone => phone.id !== id);
        this.savePhones();
        this.renderPhones();
        this.showNotification('Report removed.');
    }

    savePhones() {
        localStorage.setItem('lostPhones', JSON.stringify(this.phones));
    }

    loadPhones() {
        const data = localStorage.getItem('lostPhones');
        return data ? JSON.parse(data) : [];
    }

    renderPhones(phonesToRender = this.phones) {
        const list = document.getElementById('phonesList');

        if (phonesToRender.length === 0) {
            list.innerHTML = '<p class="no-data">No lost phones reported yet.</p>';
            return;
        }

        list.innerHTML = phonesToRender.map(phone => `
            <div class="phone-card">
                <h3>📱 ${phone.phoneModel} - ${phone.color}</h3>
                <div class="card-info">
                    <div class="info-row">
                        <strong>Owner:</strong>
                        <span>${phone.ownerName}</span>
                    </div>
                    <div class="info-row">
                        <strong>Date Lost:</strong>
                        <span>${phone.lostDate}</span>
                    </div>
                    <div class="info-row">
                        <strong>Last Location:</strong>
                        <span>${phone.location}</span>
                    </div>
                    <div class="info-row">
                        <strong>Status:</strong>
                        <span><div class="status-badge">Still Lost</div></span>
                    </div>
                </div>
                
                ${phone.description ? `
                    <div class="card-description">
                        <strong>Details:</strong> ${phone.description}
                    </div>
                ` : ''}

                <div class="card-footer">
                    <div class="contact-info">
                        <strong>Contact:</strong><br>
                        📞 ${phone.phoneNumber}<br>
                        📧 ${phone.email}
                    </div>
                    <button class="btn-delete" onclick="tracker.removePhone(${phone.id})">Remove Report</button>
                </div>
            </div>
        `).join('');
    }

    searchPhones(query) {
        const lowerQuery = query.toLowerCase();
        return this.phones.filter(phone =>
            phone.ownerName.toLowerCase().includes(lowerQuery) ||
            phone.phoneModel.toLowerCase().includes(lowerQuery) ||
            phone.color.toLowerCase().includes(lowerQuery) ||
            phone.location.toLowerCase().includes(lowerQuery) ||
            phone.description.toLowerCase().includes(lowerQuery)
        );
    }

    showNotification(message) {
        // Simple notification (could be enhanced with a toast library)
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 25px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }
}

// Search functionality
function filterPhones() {
    const searchQuery = document.getElementById('searchInput').value;
    if (searchQuery.trim() === '') {
        tracker.renderPhones();
    } else {
        const results = tracker.searchPhones(searchQuery);
        tracker.renderPhones(results);
    }
}

// Allow Enter key to trigger search
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterPhones();
            }
        });
    }
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app
const tracker = new LostPhoneTracker();