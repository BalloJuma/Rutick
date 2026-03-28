/**
 * UI Module
 * Handles navigation, modals, notifications, and dashboard display
 */

// Safe text encoding
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Navigation functions
function goToHome() {
    console.log('goToHome() called');
    const homePage = document.getElementById('homePage');
    const appPages = document.getElementById('appPages');
    if (homePage) homePage.style.display = 'block';
    if (appPages) appPages.style.display = 'none';
}

function goToAuth(defaultTab = 'login') {
    console.log('goToAuth() called');
    const homePage = document.getElementById('homePage');
    const appPages = document.getElementById('appPages');
    const authSection = document.getElementById('authSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const userInfo = document.getElementById('userInfo');

    if (homePage) {
        homePage.style.display = 'none';
        console.log('Hidden homePage');
    }
    if (appPages) {
        appPages.style.display = 'block';
        console.log('Showed appPages');
    }
    if (authSection) {
        authSection.style.display = 'block';
        console.log('Showed authSection');
    }
    if (dashboardSection) {
        dashboardSection.style.display = 'none';
        console.log('Hidden dashboardSection');
    }
    if (userInfo) {
        userInfo.style.display = 'none';
        console.log('Hidden userInfo');
    }

    // Switch to the specified tab
    switchTab(defaultTab);

    console.log('goToAuth() navigation complete');
}

// Password visibility toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;

    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈'; // Hide icon
        button.title = 'Hide Password';
    } else {
        input.type = 'password';
        button.textContent = '👁️'; // Show icon
        button.title = 'Show Password';
    }
}

function showDashboard() {
    if (!isAuthenticated()) {
        showNotification('Error', 'Please log in first', 'error');
        return;
    }

    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('userInfo').style.display = 'flex';

    // Use textContent instead of innerHTML to prevent XSS attacks
    const userNameElement = document.getElementById('userName');
    userNameElement.textContent = currentUser.firstName + ' ' + currentUser.lastName;

    const userRoleElement = document.getElementById('userRole');
    userRoleElement.textContent = currentUser.role.toUpperCase();

    const avatarElement = document.getElementById('userAvatar');
    avatarElement.textContent = currentUser.firstName.charAt(0).toUpperCase();

    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) {
        createEventBtn.style.display = 'none';
        if (currentUser.role === 'admin' || currentUser.role === 'staff') {
            createEventBtn.style.display = 'block';
        }
    }

    updateStats();
    loadReminders();
    loadEvents();
}

async function loadReminders() {
    if (!isAuthenticated()) return;

    const reminderContainer = document.getElementById('reminderSection');
    const reminderList = document.getElementById('reminderList');
    if (!reminderContainer || !reminderList) return;

    const result = await userAPI.getReminders(currentUser.id);
    if (!result.success) {
        reminderList.innerHTML = '<p class="empty-state">Failed to load reminders.</p>';
        return;
    }

    const reminders = result.data.reminders || [];
    if (reminders.length === 0) {
        reminderList.innerHTML = '<p class="empty-state">No reminders yet. Register for events to get reminders.</p>';
        return;
    }

    reminderList.innerHTML = '';
    reminders.forEach(reminder => {
        const reminderCard = document.createElement('div');
        reminderCard.className = `reminder-card ${reminder.read ? 'reminder-read' : 'reminder-unread'}`;

        let eventTitle = 'Event';
        if (reminder.event && reminder.event.title) eventTitle = reminder.event.title;

        const row = document.createElement('div');
        row.className = 'reminder-row';
        row.innerHTML = `
            <div><strong>${escapeHtml(eventTitle)}</strong></div>
            <div>${new Date(reminder.scheduledFor).toLocaleString()}</div>
            <div>${escapeHtml(reminder.status)}</div>
        `;

        const actions = document.createElement('div');
        actions.className = 'reminder-actions';
        if (reminder.read) {
            const badge = document.createElement('span');
            badge.className = 'badge badge-success';
            badge.textContent = 'Read';
            actions.appendChild(badge);
        } else {
            const button = document.createElement('button');
            button.className = 'btn btn-sm';
            button.type = 'button';
            button.textContent = 'Mark as read';
            button.addEventListener('click', () => markReminderAsRead(reminder.id));
            actions.appendChild(button);
        }

        reminderCard.appendChild(row);
        reminderCard.appendChild(actions);
        reminderList.appendChild(reminderCard);
    });
}

async function markReminderAsRead(reminderId) {
    const result = await userAPI.markReminderRead(currentUser.id, reminderId);
    if (result.success) {
        showNotification('Success', 'Reminder marked as read', 'success');
        loadReminders();
    } else {
        showNotification('Error', result.error || 'Failed to mark reminder as read', 'error');
    }
}

function closeModal() {
    document.getElementById('eventModal').classList.remove('active');
}

function showCreateEvent() {
    document.getElementById('createEventModal').classList.add('active');
}

function closeCreateEventModal() {
    document.getElementById('createEventModal').classList.remove('active');
}

function showNotification(title, message, type = 'success') {
    const box = document.getElementById('notificationBox');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-icon">${type === 'success' ? '✅' : '❌'}</div>
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    box.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

async function downloadTicket(eventId) {
    if (!currentUser) {
        showNotification('Error', 'Please log in to download your ticket', 'error');
        return;
    }

    const result = await eventAPI.getById(eventId);
    if (!result.success || !result.data?.event) {
        showNotification('Error', 'Event not found', 'error');
        return;
    }

    const event = result.data.event;
    const ticketContent = [
        'EVENT TICKET',
        '====================',
        `Event: ${event.title}`,
        `Date: ${formatDate(event.date)}`,
        `Time: ${event.time}`,
        `Location: ${event.location}`,
        '',
        `Attendee: ${currentUser.firstName} ${currentUser.lastName}`,
        `Email: ${currentUser.email}`,
        '',
        `Ticket ID: ${eventId}-${currentUser.id}`,
        '====================',
        '',
        'Keep this ticket for your records.'
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(ticketContent));
    element.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_ticket.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showNotification('Success', 'Ticket downloaded successfully');
}
