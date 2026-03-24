/**
 * UI Module
 * Handles navigation, modals, notifications, and dashboard display
 */

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

    if (currentUser.role === 'admin' || currentUser.role === 'staff') {
        document.getElementById('createEventBtn').style.display = 'block';
    }

    updateStats();
    loadEvents();
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

function downloadTicket(eventId) {
    const event = events.find(e => e.id === eventId);

    if (!event) {
        showNotification('Error', 'Event not found', 'error');
        return;
    }

    // Create safe ticket content (text only, no HTML)
    const ticketContent = [
        'EVENT TICKET',
        '====================',
        'Event: ' + event.title,
        'Date: ' + event.date,
        'Time: ' + event.time,
        'Location: ' + event.location,
        '',
        'Attendee: ' + currentUser.firstName + ' ' + currentUser.lastName,
        'Email: ' + currentUser.email,
        '',
        'Ticket ID: TICKET_' + eventId + '_' + currentUser.id,
        '====================',
        '',
        'Keep this ticket for your records.'
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(ticketContent));
    element.setAttribute('download', event.title + '_ticket.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showNotification('Success', 'Ticket downloaded successfully');
}
