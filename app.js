// Lost Phones database (using localStorage)
class LostPhoneTracker {
    constructor() {
        this.phones = this.loadPhones();
        this.currentFilter = 'all';
        this.currentView = 'grid';
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.updateStats();
        this.renderPhones();
    }

    attachEventListeners() {
        // Form submission
        const form = document.getElementById('phoneForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.closest('.tab-btn')));
        });

        // Search and filters
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.filterPhones();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.closest('.filter-btn')));
        });

        // View toggle
        document.getElementById('gridView').addEventListener('click', () => this.setView('grid'));
        document.getElementById('listView').addEventListener('click', () => this.setView('list'));
    }

    switchTab(tabBtn) {
        // Remove active from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active to clicked tab
        tabBtn.classList.add('active');
        const tabId = tabBtn.dataset.tab;
        document.getElementById(tabId).classList.add('active');

        // Update stats if viewing stats tab
        if (tabId === 'stats') {
            this.updateStats();
            this.renderStatistics();
        }
    }

    setFilter(filterBtn) {
        // Remove active from all filters
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active to clicked filter
        filterBtn.classList.add('active');
        this.currentFilter = filterBtn.dataset.filter;

        // Apply filter and render
        this.filterPhones();
    }

    setView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        
        if (view === 'grid') {
            document.getElementById('gridView').classList.add('active');
            document.getElementById('phonesList').classList.remove('list-view');
            document.getElementById('phonesList').classList.add('grid-view');
        } else {
            document.getElementById('listView').classList.add('active');
            document.getElementById('phonesList').classList.remove('grid-view');
            document.getElementById('phonesList').classList.add('list-view');
        }
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
            reward: parseInt(document.getElementById('reward').value) || 0,
            reportedAt: new Date().toLocaleDateString(),
            reportedAtFull: new Date()
        };

        this.addPhone(phone);
        this.updateStats();
        this.renderPhones();
        document.getElementById('phoneForm').reset();
        this.showToast('Phone reported successfully!', 'success');
    }

    addPhone(phone) {
        this.phones.unshift(phone);
        this.savePhones();
    }

    removePhone(id) {
        this.phones = this.phones.filter(phone => phone.id !== id);
        this.savePhones();
        this.updateStats();
        this.renderPhones();
        this.showToast('Report removed.', 'info');
    }

    copyToClipboard(text, type) {
        navigator.clipboard.writeText(text);
        this.showToast(`${type} copied to clipboard!`, 'success');
    }

    savePhones() {
        localStorage.setItem('lostPhones', JSON.stringify(this.phones));
    }

    loadPhones() {
        const data = localStorage.getItem('lostPhones');
        return data ? JSON.parse(data) : [];
    }

    filterPhones() {
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        let filtered = this.phones;

        // Filter by search query
        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(phone =>
                phone.ownerName.toLowerCase().includes(searchQuery) ||
                phone.phoneModel.toLowerCase().includes(searchQuery) ||
                phone.color.toLowerCase().includes(searchQuery) ||
                phone.location.toLowerCase().includes(searchQuery) ||
                phone.description.toLowerCase().includes(searchQuery)
            );
        }

        // Filter by category
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        switch (this.currentFilter) {
            case 'today':
                filtered = filtered.filter(phone => {
                    const phoneDate = new Date(phone.lostDate);
                    return phoneDate >= today;
                });
                break;
            case 'week':
                filtered = filtered.filter(phone => {
                    const phoneDate = new Date(phone.lostDate);
                    return phoneDate >= weekAgo;
                });
                break;
            case 'reward':
                filtered = filtered.filter(phone => phone.reward > 0);
                break;
        }

        this.renderPhones(filtered);
    }

    renderPhones(phonesToRender = this.phones) {
        const list = document.getElementById('phonesList');

        if (phonesToRender.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-mobile-alt"></i>
                    <p>No lost phones found.</p>
                    <p class="empty-subtitle">Try adjusting your filters</p>
                </div>
            `;
            return;
        }

        list.innerHTML = phonesToRender.map(phone => {
            const daysLost = Math.floor((new Date() - new Date(phone.lostDate)) / (1000 * 60 * 60 * 24));
            const urgentBadge = daysLost <= 1 ? '<span class="badge urgent"><i class="fas fa-exclamation-circle"></i> Urgent</span>' : '';
            const rewardBadge = phone.reward > 0 ? `<span class="badge reward"><i class="fas fa-gift"></i> $${phone.reward}</span>` : '';

            return `
                <div class="phone-card">
                    <div class="card-header">
                        <h3><i class="fas fa-mobile-alt"></i> ${phone.phoneModel}</h3>
                        <div style="display: flex; gap: 8px;">
                            ${urgentBadge}
                            ${rewardBadge}
                        </div>
                    </div>

                    <div class="card-info">
                        <div class="info-row">
                            <strong><i class="fas fa-user"></i> Owner</strong>
                            <span>${phone.ownerName}</span>
                        </div>
                        <div class="info-row">
                            <strong><i class="fas fa-palette"></i> Color</strong>
                            <span>${phone.color}</span>
                        </div>
                        <div class="info-row">
                            <strong><i class="fas fa-calendar"></i> Date Lost</strong>
                            <span>${phone.lostDate} (${daysLost}d ago)</span>
                        </div>
                        <div class="info-row">
                            <strong><i class="fas fa-map-marker-alt"></i> Location</strong>
                            <span>${phone.location}</span>
                        </div>
                    </div>

                    ${phone.description ? `
                        <div class="card-description">
                            <strong>Details:</strong> ${phone.description}
                        </div>
                    ` : ''}

                    <div class="card-footer">
                        <div class="contact-section">
                            <div class="contact-info">
                                <strong>Contact Information:</strong>
                                <div style="margin-top: 8px;">
                                    <div class="contact-link" onclick="tracker.copyToClipboard('${phone.phoneNumber}', 'Phone')">
                                        <i class="fas fa-phone"></i> ${phone.phoneNumber}
                                    </div>
                                    <div class="contact-link" onclick="tracker.copyToClipboard('${phone.email}', 'Email')">
                                        <i class="fas fa-envelope"></i> ${phone.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button class="btn-delete" onclick="tracker.removePhone(${phone.id})">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const totalPhones = this.phones.length;
        const todayPhones = this.phones.filter(p => new Date(p.lostDate) >= today).length;
        const weekPhones = this.phones.filter(p => {
            const phoneDate = new Date(p.lostDate);
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return phoneDate >= weekAgo;
        }).length;
        const totalRewards = this.phones.reduce((sum, p) => sum + (p.reward || 0), 0);

        // Update header stats
        document.getElementById('totalPhones').textContent = totalPhones;
        document.getElementById('todayPhones').textContent = todayPhones;

        // Update stats tab
        document.getElementById('statTotal').textContent = totalPhones;
        document.getElementById('statWeek').textContent = weekPhones;
        document.getElementById('statToday').textContent = todayPhones;
        document.getElementById('statRewards').textContent = '$' + totalRewards;
    }

    renderStatistics() {
        // Most lost phone models
        const modelCount = {};
        this.phones.forEach(phone => {
            modelCount[phone.phoneModel] = (modelCount[phone.phoneModel] || 0) + 1;
        });

        const topModels = Object.entries(modelCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const modelsHtml = topModels.length > 0
            ? topModels.map(([model, count]) => `
                <div class="chart-item">
                    <div class="chart-label">${model}</div>
                    <div class="chart-bar" style="width: 100%;">
                        <div class="chart-value">${count}</div>
                    </div>
                </div>
            `).join('')
            : '<p style="color: #999;">No data yet</p>';

        document.getElementById('phoneModelsChart').innerHTML = modelsHtml;

        // Top locations
        const locationCount = {};
        this.phones.forEach(phone => {
            locationCount[phone.location] = (locationCount[phone.location] || 0) + 1;
        });

        const topLocations = Object.entries(locationCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const locationsHtml = topLocations.length > 0
            ? topLocations.map(([location, count]) => `
                <div class="chart-item">
                    <div class="chart-label">${location}</div>
                    <div class="chart-bar" style="width: 100%;">
                        <div class="chart-value">${count}</div>
                    </div>
                </div>
            `).join('')
            : '<p style="color: #999;">No data yet</p>';

        document.getElementById('locationsChart').innerHTML = locationsHtml;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new LostPhoneTracker();
});