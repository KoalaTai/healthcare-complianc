/**
 * Notification polling and management
 * Handles real-time notification updates for authenticated users
 */

(function() {
    'use strict';
    
    const NotificationManager = {
        pollInterval: 30000, // 30 seconds
        maxRetries: 3,
        retryCount: 0,
        isPolling: false,
        
        init: function() {
            this.startPolling();
            this.bindEvents();
            this.loadInitialNotifications();
        },
        
        startPolling: function() {
            if (this.isPolling) return;
            
            this.isPolling = true;
            this.poll();
            
            // Set up interval
            this.intervalId = setInterval(() => {
                this.poll();
            }, this.pollInterval);
            
            console.log('Notification polling started');
        },
        
        stopPolling: function() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            this.isPolling = false;
            console.log('Notification polling stopped');
        },
        
        poll: function() {
            if (!window.VirtualBackroom) {
                console.warn('VirtualBackroom not available for notifications');
                return;
            }
            
            VirtualBackroom.utils.apiRequest('/api/notifications')
                .then(response => {
                    if (response.success) {
                        this.updateNotifications(response.notifications);
                        this.retryCount = 0; // Reset retry count on success
                    }
                })
                .catch(error => {
                    console.error('Notification polling failed:', error);
                    this.handlePollError();
                });
        },
        
        handlePollError: function() {
            this.retryCount++;
            
            if (this.retryCount >= this.maxRetries) {
                console.warn('Max notification polling retries reached, stopping');
                this.stopPolling();
                
                // Show user notification about connection issue
                if (window.VirtualBackroom && window.VirtualBackroom.utils) {
                    VirtualBackroom.utils.showAlert(
                        'Connection to notification service lost. Refresh the page to reconnect.',
                        'warning'
                    );
                }
            }
        },
        
        loadInitialNotifications: function() {
            this.poll(); // Load notifications immediately
        },
        
        updateNotifications: function(notifications) {
            this.updateNotificationDropdown(notifications);
            this.updateNotificationBadge(notifications);
        },
        
        updateNotificationDropdown: function(notifications) {
            const dropdown = document.getElementById('notificationsList');
            if (!dropdown) return;
            
            if (notifications.length === 0) {
                dropdown.innerHTML = '<li><span class="dropdown-item-text text-muted">No new notifications</span></li>';
                return;
            }
            
            // Show only unread notifications in dropdown, limit to 5
            const unreadNotifications = notifications
                .filter(n => n.status === 'unread')
                .slice(0, 5);
            
            if (unreadNotifications.length === 0) {
                dropdown.innerHTML = '<li><span class="dropdown-item-text text-muted">No new notifications</span></li>';
                return;
            }
            
            dropdown.innerHTML = unreadNotifications.map(notification => {
                const icon = this.getNotificationIcon(notification.type);
                const truncatedMessage = notification.message.length > 60 
                    ? notification.message.substring(0, 60) + '...' 
                    : notification.message;
                
                return `
                    <li>
                        <a class="dropdown-item py-2 notification-item" 
                           href="${notification.link || '#'}" 
                           data-notification-id="${notification.id}">
                            <div class="d-flex align-items-start">
                                <div class="flex-shrink-0 me-2">
                                    ${icon}
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1 fs-6 fw-bold">${notification.title}</h6>
                                    <p class="mb-1 small text-muted">${truncatedMessage}</p>
                                    <small class="text-muted">${this.formatTimeAgo(notification.created_date)}</small>
                                </div>
                            </div>
                        </a>
                    </li>
                `;
            }).join('');
            
            // Add "View all" link if there are more notifications
            if (notifications.length > 5) {
                dropdown.innerHTML += `
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-center" href="/notifications">View all notifications</a></li>
                `;
            }
        },
        
        updateNotificationBadge: function(notifications) {
            const badge = document.getElementById('notificationBadge');
            if (!badge) return;
            
            const unreadCount = notifications.filter(n => n.status === 'unread').length;
            
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        },
        
        getNotificationIcon: function(type) {
            const icons = {
                'simulation': '<i class="bi bi-play-circle text-primary"></i>',
                'system': '<i class="bi bi-gear text-secondary"></i>',
                'reminder': '<i class="bi bi-clock text-warning"></i>',
                'document': '<i class="bi bi-file-text text-info"></i>',
                'error': '<i class="bi bi-exclamation-triangle text-danger"></i>',
                'success': '<i class="bi bi-check-circle text-success"></i>'
            };
            return icons[type] || '<i class="bi bi-info-circle text-info"></i>';
        },
        
        formatTimeAgo: function(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            
            if (diffInSeconds < 60) {
                return 'Just now';
            }
            
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) {
                return `${diffInMinutes}m ago`;
            }
            
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) {
                return `${diffInHours}h ago`;
            }
            
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) {
                return `${diffInDays}d ago`;
            }
            
            return date.toLocaleDateString();
        },
        
        markAsRead: function(notificationId) {
            if (!window.VirtualBackroom || !window.VirtualBackroom.utils) {
                console.warn('VirtualBackroom not available');
                return;
            }
            
            return VirtualBackroom.utils.apiRequest(`/api/notifications/${notificationId}/mark_read`, {
                method: 'POST'
            })
            .then(response => {
                if (response.success) {
                    // Refresh notifications to update UI
                    this.poll();
                }
                return response;
            });
        },
        
        bindEvents: function() {
            // Mark notification as read when clicked
            document.addEventListener('click', (event) => {
                const notificationItem = event.target.closest('.notification-item');
                if (notificationItem) {
                    const notificationId = notificationItem.dataset.notificationId;
                    if (notificationId) {
                        this.markAsRead(notificationId);
                    }
                }
            });
            
            // Handle page visibility change (stop polling when hidden)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.stopPolling();
                } else {
                    this.startPolling();
                }
            });
            
            // Handle online/offline events
            window.addEventListener('online', () => {
                console.log('Connection restored, resuming notification polling');
                this.retryCount = 0;
                if (!this.isPolling) {
                    this.startPolling();
                }
            });
            
            window.addEventListener('offline', () => {
                console.log('Connection lost, stopping notification polling');
                this.stopPolling();
            });
        }
    };
    
    // Initialize notification manager when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Only initialize for authenticated users
        if (document.querySelector('#notificationDropdown')) {
            NotificationManager.init();
        }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (NotificationManager.isPolling) {
            NotificationManager.stopPolling();
        }
    });
    
    // Export for external use
    window.NotificationManager = NotificationManager;
})();