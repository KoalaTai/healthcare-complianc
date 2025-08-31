/**
 * Main JavaScript file for VirtualBackroom.ai
 * Contains global utilities and initialization code
 */

// Global application object
window.VirtualBackroom = {
    // Configuration
    config: {
        apiVersion: 'v2',
        pollInterval: 30000, // 30 seconds
        csrfToken: null
    },
    
    // Utilities
    utils: {},
    
    // Services
    services: {},
    
    // Initialize application
    init: function() {
        this.initCSRFToken();
        this.initEventHandlers();
        this.initTooltips();
        console.log('VirtualBackroom.ai initialized');
    },
    
    // Initialize CSRF token from meta tag
    initCSRFToken: function() {
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        if (csrfMeta) {
            this.config.csrfToken = csrfMeta.getAttribute('content');
        }
    },
    
    // Initialize global event handlers
    initEventHandlers: function() {
        // Handle all AJAX forms with data-ajax="true"
        document.addEventListener('submit', function(event) {
            const form = event.target;
            if (form.dataset.ajax === 'true') {
                event.preventDefault();
                VirtualBackroom.utils.submitAjaxForm(form);
            }
        });
        
        // Handle notification mark as read
        document.addEventListener('click', function(event) {
            if (event.target.matches('.notification-mark-read')) {
                event.preventDefault();
                const notificationId = event.target.dataset.notificationId;
                VirtualBackroom.services.markNotificationRead(notificationId);
            }
        });
    },
    
    // Initialize Bootstrap tooltips
    initTooltips: function() {
        if (typeof bootstrap !== 'undefined') {
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }
};

// Utilities
VirtualBackroom.utils = {
    // Make authenticated API requests
    apiRequest: function(url, options = {}) {
        const defaults = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        };
        
        // Add CSRF token for non-GET requests
        if (options.method !== 'GET' && VirtualBackroom.config.csrfToken) {
            defaults.headers['X-CSRFToken'] = VirtualBackroom.config.csrfToken;
        }
        
        const config = Object.assign({}, defaults, options);
        config.headers = Object.assign({}, defaults.headers, options.headers || {});
        
        return fetch(url, config)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('API request failed:', error);
                this.showAlert('Request failed: ' + error.message, 'error');
                throw error;
            });
    },
    
    // Submit form via AJAX
    submitAjaxForm: function(form) {
        const formData = new FormData(form);
        const url = form.action || window.location.pathname;
        const method = form.method || 'POST';
        
        // Convert FormData to JSON if needed
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        this.apiRequest(url, {
            method: method,
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.success) {
                this.showAlert(response.message || 'Action completed successfully', 'success');
                
                // Handle redirects
                if (response.redirect_url) {
                    window.location.href = response.redirect_url;
                }
            } else {
                this.showAlert(response.message || 'Action failed', 'error');
            }
        })
        .catch(error => {
            this.showAlert('Form submission failed', 'error');
        });
    },
    
    // Show alert message
    showAlert: function(message, type = 'info') {
        const alertContainer = document.getElementById('alert-container') || this.createAlertContainer();
        
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        alertElement.innerHTML = `
            ${this.getAlertIcon(type)}${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        alertContainer.appendChild(alertElement);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.remove();
            }
        }, 5000);
    },
    
    // Create alert container if it doesn't exist
    createAlertContainer: function() {
        const container = document.createElement('div');
        container.id = 'alert-container';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    },
    
    // Get icon for alert type
    getAlertIcon: function(type) {
        const icons = {
            'success': '<i class="bi bi-check-circle me-2"></i>',
            'error': '<i class="bi bi-exclamation-triangle me-2"></i>',
            'warning': '<i class="bi bi-exclamation-triangle me-2"></i>',
            'info': '<i class="bi bi-info-circle me-2"></i>'
        };
        return icons[type] || icons['info'];
    },
    
    // Format date for display
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Format date and time for display
    formatDateTime: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
};

// Services
VirtualBackroom.services = {
    // Mark notification as read
    markNotificationRead: function(notificationId) {
        return VirtualBackroom.utils.apiRequest(`/api/notifications/${notificationId}/mark_read`, {
            method: 'POST'
        })
        .then(response => {
            if (response.success) {
                // Update UI to show notification as read
                const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
                if (notificationElement) {
                    notificationElement.classList.add('text-muted');
                    notificationElement.classList.remove('fw-bold');
                }
                
                // Update notification badge
                this.updateNotificationBadge();
            }
        });
    },
    
    // Update notification badge count
    updateNotificationBadge: function() {
        VirtualBackroom.utils.apiRequest('/api/notifications')
            .then(response => {
                if (response.success) {
                    const unreadCount = response.notifications.filter(n => n.status === 'unread').length;
                    const badge = document.getElementById('notificationBadge');
                    
                    if (badge) {
                        if (unreadCount > 0) {
                            badge.textContent = unreadCount;
                            badge.style.display = 'inline';
                        } else {
                            badge.style.display = 'none';
                        }
                    }
                }
            });
    },
    
    // Get system health status
    getSystemHealth: function() {
        return VirtualBackroom.utils.apiRequest('/api/system-health');
    },
    
    // Get AI provider status
    getAIProviderStatus: function() {
        return VirtualBackroom.utils.apiRequest('/api/v2/monitoring/providers/status');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    VirtualBackroom.init();
});

// Export for use in other scripts
window.VB = VirtualBackroom;