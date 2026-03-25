/**
 * Events Module
 * Handles event loading, creation, viewing, registration, and filtering
 */

let currentFilter = 'all';

// Sample data (will be replaced with backend calls)
let events = [
    {
        id: 1,
        title: 'Computer Science Symposium 2024',
        category: 'academic',
        description: 'Annual symposium featuring latest research in AI, Machine Learning, and Data Science.',
        date: '2024-11-15',
        time: '09:00',
        location: 'Main Auditorium',
        capacity: 200,
        registered: 87,
        attended: 0,
        organizer: 'CS Department',
        rating: 4.5,
        reviews: [
            { user: 'John Doe', rating: 5, text: 'Excellent presentations!', date: '2024-10-20' },
            { user: 'Jane Smith', rating: 4, text: 'Very informative.', date: '2024-10-21' }
        ],
        photos: ['📊', '💻', '🎓'],
        registrants: []
    },
    {
        id: 2,
        title: 'Campus Cultural Festival',
        category: 'social',
        description: 'Celebrate diversity with music, dance, food, and cultural performances.',
        date: '2024-11-20',
        time: '14:00',
        location: 'University Grounds',
        capacity: 500,
        registered: 342,
        attended: 0,
        organizer: 'Student Affairs',
        rating: 4.8,
        reviews: [],
        photos: ['🎭', '🎵', '🍽️'],
        registrants: []
    },
    {
        id: 3,
        title: 'Career Fair 2024',
        category: 'academic',
        description: 'Meet top employers and explore career opportunities across various industries.',
        date: '2024-11-25',
        time: '10:00',
        location: 'Sports Complex',
        capacity: 300,
        registered: 156,
        attended: 0,
        organizer: 'Career Services',
        rating: 4.6,
        reviews: [],
        photos: ['💼', '🤝', '🎯'],
        registrants: []
    },
    {
        id: 4,
        title: 'Student Council Elections',
        category: 'administrative',
        description: 'Vote for your student representatives. Your voice matters!',
        date: '2024-11-10',
        time: '08:00',
        location: 'Various Polling Stations',
        capacity: 1000,
        registered: 678,
        attended: 0,
        organizer: 'Student Council',
        rating: 4.2,
        reviews: [],
        photos: ['🗳️', '✅', '👥'],
        registrants: []
    }
];

async function updateStats() {
    try {
        // Get all events from backend
        const eventsResult = await eventAPI.getAll();
        const allEvents = eventsResult.success ? (eventsResult.data.events || []) : [];

        // Count stats from backend data
        const userRegistrations = allEvents.filter(e => e.isRegistered);
        const upcoming = allEvents.filter(e => new Date(e.date) > new Date());

        document.getElementById('totalEvents').textContent = allEvents.length;
        document.getElementById('registeredEvents').textContent = userRegistrations.length;
        document.getElementById('attendedEvents').textContent = '0'; // Would need backend endpoint
        document.getElementById('upcomingEvents').textContent = upcoming.length;
    } catch (error) {
        console.error('Error updating stats:', error);
        // Set default values on error
        document.getElementById('totalEvents').textContent = '0';
        document.getElementById('registeredEvents').textContent = '0';
        document.getElementById('attendedEvents').textContent = '0';
        document.getElementById('upcomingEvents').textContent = '0';
    }
}

async function loadEvents() {
    const grid = document.getElementById('eventsGrid');
    grid.innerHTML = '<div style="text-align: center; padding: 40px;">Loading events...</div>';

    try {
        // Fetch events from backend API
        const result = await eventAPI.getAll();

        if (!result.success) {
            grid.innerHTML = '<div class="empty-state"><h3>Failed to load events</h3><p>' + (result.error || 'Please try again later') + '</p></div>';
            return;
        }

        const allEvents = result.data.events || [];
        const filteredEvents = allEvents.filter(event => {
            if (currentFilter === 'all') return true;
            return event.category === currentFilter;
        });

        if (filteredEvents.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h3>No events found</h3><p>Check back later for new events!</p></div>';
            return;
        }

        grid.innerHTML = '';

        filteredEvents.forEach(event => {
            const isRegistered = event.isRegistered || false;
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date();

            const card = document.createElement('div');
            card.className = 'event-card';
            card.setAttribute('data-event-id', event.id);

            // Build card safely using DOM methods (prevents XSS)
            const eventImage = document.createElement('div');
            eventImage.className = 'event-image';

            // Check for image or banner field (banner is from backend)
            const imageUrl = event.image || event.banner;

            if (imageUrl) {
                // Display uploaded image
                eventImage.style.backgroundImage = `url('${imageUrl}')`;
                eventImage.style.backgroundSize = 'cover';
                eventImage.style.backgroundPosition = 'center';
            } else {
                // Fallback to emoji if no image
                eventImage.textContent = '📅';
            }
            card.appendChild(eventImage);

            const category = document.createElement('span');
            category.className = `event-category category-${event.category}`;
            category.textContent = event.category.toUpperCase();
            card.appendChild(category);

            const title = document.createElement('div');
            title.className = 'event-title';
            title.textContent = event.title;
            card.appendChild(title);

            const dateInfo = document.createElement('div');
            dateInfo.className = 'event-details';
            dateInfo.textContent = '📅 ' + new Date(event.date).toLocaleDateString();
            card.appendChild(dateInfo);

            const timeInfo = document.createElement('div');
            timeInfo.className = 'event-details';
            timeInfo.textContent = '⏰ ' + (event.time || 'TBD');
            card.appendChild(timeInfo);

            const locationInfo = document.createElement('div');
            locationInfo.className = 'event-details';
            locationInfo.textContent = '📍 ' + event.location;
            card.appendChild(locationInfo);

            const capacityInfo = document.createElement('div');
            capacityInfo.className = 'event-details';
            capacityInfo.textContent = '👥 ' + (event.registeredCount || 0) + '/' + event.capacity + ' registered';
            card.appendChild(capacityInfo);

            if (isRegistered) {
                const badge = document.createElement('span');
                badge.className = 'badge badge-success';
                badge.textContent = '✓ Registered';
                card.appendChild(badge);
            }

            if (isPast) {
                const badge = document.createElement('span');
                badge.className = 'badge badge-danger';
                badge.textContent = 'Past Event';
                card.appendChild(badge);
            }

            const actions = document.createElement('div');
            actions.className = 'event-actions';

            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn btn-info';
            viewBtn.textContent = 'View Details';
            viewBtn.onclick = () => viewEvent(event.id);
            actions.appendChild(viewBtn);

            if (!isRegistered && !isPast) {
                const registerBtn = document.createElement('button');
                registerBtn.className = 'btn btn-success';
                registerBtn.textContent = 'Register';
                registerBtn.onclick = () => registerForEvent(event.id);
                actions.appendChild(registerBtn);
            }

            if (isRegistered) {
                const ticketBtn = document.createElement('button');
                ticketBtn.className = 'btn btn-warning';
                ticketBtn.textContent = 'View Ticket';
                ticketBtn.onclick = () => viewTicket(event._id);
                actions.appendChild(ticketBtn);
            }

            card.appendChild(actions);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading events:', error);
        grid.innerHTML = '<div class="empty-state"><h3>Error loading events</h3><p>Please refresh the page</p></div>';
    }
}

async function loadReminders() {
    const container = document.getElementById('remindersGrid');
    if (!container) return;

    container.innerHTML = '<div class="empty-state"><p>Loading reminders...</p></div>';

    const userId = currentUser?.id;
    if (!userId) {
        container.innerHTML = '<div class="empty-state"><p>Please login to see reminders</p></div>';
        return;
    }

    const result = await userAPI.getReminders(userId);
    if (!result.success) {
        container.innerHTML = '<div class="empty-state"><p>Failed to load reminders</p></div>';
        return;
    }

    const reminders = result.data.reminders || [];

    if (!reminders.length) {
        container.innerHTML = '<div class="empty-state"><p>No reminders yet</p></div>';
        return;
    }

    container.innerHTML = '';

    reminders.forEach(reminder => {
        const card = document.createElement('div');
        card.className = 'event-card';

        const title = document.createElement('div');
        title.className = 'event-title';
        title.textContent = reminder.event?.title || 'Event Reminder';
        card.appendChild(title);

        const dateInfo = document.createElement('div');
        dateInfo.className = 'event-details';
        dateInfo.textContent = '⏰ ' + new Date(reminder.scheduledFor).toLocaleString();
        card.appendChild(dateInfo);

        const status = document.createElement('div');
        status.className = 'event-details';
        status.textContent = 'Status: ' + reminder.status.toUpperCase();
        card.appendChild(status);

        const msg = document.createElement('p');
        msg.textContent = `Reminder type: ${reminder.reminderType}`;
        card.appendChild(msg);

        const buttonRow = document.createElement('div');
        buttonRow.className = 'event-actions';

        if (reminder.status !== 'read') {
            const readBtn = document.createElement('button');
            readBtn.className = 'btn btn-secondary';
            readBtn.textContent = 'Mark as Read';
            readBtn.onclick = async () => {
                const userId = currentUser?.id;
                if (!userId) {
                    showNotification('Error', 'User not authenticated', 'error');
                    return;
                }
                const res = await userAPI.markReminderRead(userId, reminder.id);
                if (res.success) {
                    showNotification('Success', 'Reminder marked as read', 'success');
                    loadReminders();
                } else {
                    showNotification('Error', res.error || 'Could not mark reminder', 'error');
                }
            };
            buttonRow.appendChild(readBtn);
        }

        card.appendChild(buttonRow);
        container.appendChild(card);
    });
}

function filterByCategory(category, btnElement = null) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

    // Add active class to the clicked button
    if (btnElement) {
        btnElement.classList.add('active');
    } else {
        // If no button element provided, find it by category
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.textContent.toLowerCase().includes(category) || (category === 'all' && btn.textContent.includes('All'))) {
                btn.classList.add('active');
            }
        });
    }

    loadEvents();
}

function filterEvents() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.event-card');

    cards.forEach(card => {
        const title = card.querySelector('.event-title').textContent.toLowerCase();
        card.style.display = title.includes(search) ? 'block' : 'none';
    });
}

function viewEvent(eventId) {
    // Fetch event from API
    eventAPI.getById(eventId).then(result => {
        if (!result.success) {
            showNotification('Error', 'Failed to load event details', 'error');
            return;
        }

        const event = result.data?.event;
        if (!event) {
            showNotification('Error', 'Failed to load event details', 'error');
            return;
        }

        const modal = document.getElementById('eventModal');
        const isRegistered = event.isRegistered || false;

        // Use textContent for safe content assignment
        document.getElementById('modalEventTitle').textContent = event.title;

        const contentContainer = document.getElementById('modalEventContent');
        contentContainer.innerHTML = ''; // Clear previous content

        // Category badge
        const category = document.createElement('span');
        category.className = 'event-category category-' + event.category;
        category.textContent = event.category.toUpperCase();
        contentContainer.appendChild(category);

        // Description
        const descSection = document.createElement('p');
        descSection.style.margin = '15px 0';
        const descLabel = document.createElement('strong');
        descLabel.textContent = 'Description:';
        descSection.appendChild(descLabel);
        descSection.appendChild(document.createElement('br'));
        descSection.appendChild(document.createTextNode(event.description));
        contentContainer.appendChild(descSection);

        // Date
        const dateP = document.createElement('p');
        dateP.appendChild(document.createTextNode('📅 Date: ' + new Date(event.date).toLocaleDateString()));
        contentContainer.appendChild(dateP);

        // Time
        const timeP = document.createElement('p');
        timeP.appendChild(document.createTextNode('⏰ Time: ' + event.time));
        contentContainer.appendChild(timeP);

        // Location
        const locationP = document.createElement('p');
        locationP.appendChild(document.createTextNode('📍 Location: ' + event.location));
        contentContainer.appendChild(locationP);

        // Capacity & Registration
        const capacityP = document.createElement('p');
        const registeredCount = event.registeredCount || 0;
        capacityP.appendChild(document.createTextNode('👥 Registered: ' + registeredCount + '/' + event.capacity));
        contentContainer.appendChild(capacityP);

        // Organizer
        const organizerP = document.createElement('p');
        const organizerName = event.organizer ?
            (event.organizer.firstName + ' ' + event.organizer.lastName) :
            'Organizer';
        organizerP.appendChild(document.createTextNode('👤 Organizer: ' + organizerName));
        contentContainer.appendChild(organizerP);

        // Registered badge
        if (isRegistered) {
            const badge = document.createElement('div');
            badge.className = 'certificate-badge';
            badge.textContent = '✓ You are registered for this event';
            contentContainer.appendChild(badge);
        }

        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'action-buttons';
        actions.style.marginTop = '20px';

        const eventDate = new Date(event.date);
        const isPast = eventDate < new Date();

        if (!isRegistered && !isPast) {
            const registerBtn = document.createElement('button');
            registerBtn.className = 'btn btn-success';
            registerBtn.textContent = 'Register Now';
            registerBtn.onclick = function() {
                registerForEvent(eventId);
                closeModal();
            };
            actions.appendChild(registerBtn);
        }

        if (isRegistered) {
            const ticketBtn = document.createElement('button');
            ticketBtn.className = 'btn btn-warning';
            ticketBtn.textContent = 'View My Ticket';
            ticketBtn.onclick = function() { viewTicket(eventId); };
            actions.appendChild(ticketBtn);
        }

        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn btn-secondary';
        closeBtn.textContent = 'Close';
        closeBtn.onclick = closeModal;
        actions.appendChild(closeBtn);

        contentContainer.appendChild(actions);

        modal.classList.add('active');
    }).catch(error => {
        console.error('Error fetching event:', error);
        showNotification('Error', 'Failed to load event details', 'error');
    });
}

function registerForEvent(eventId) {
    if (!isAuthenticated()) {
        showNotification('Error', 'Please log in first', 'error');
        return;
    }

    // Call API to register
    registrationAPI.register(eventId).then(result => {
        if (result.success) {
            // Store registration data for later use
            sessionStorage.setItem(`registration_${eventId}`, JSON.stringify(result.data.registration));
            updateStats();
            loadEvents();
            showNotification('Registration Successful', 'You are now registered for this event!', 'success');
        } else {
            showNotification('Error', result.message || 'Failed to register for event', 'error');
        }
    }).catch(error => {
        console.error('Registration error:', error);
        showNotification('Error', 'Failed to register for event', 'error');
    });
}

function viewTicket(eventId) {
    if (!isAuthenticated()) {
        showNotification('Error', 'Please log in first', 'error');
        return;
    }

    // Fetch both event and registration details
    Promise.all([
        eventAPI.getById(eventId),
        registrationAPI.getMyRegistration(eventId)
    ]).then(([eventResult, regResult]) => {
        if (!eventResult.success) {
            showNotification('Error', 'Failed to load ticket', 'error');
            return;
        }

        const event = eventResult.data?.event;
        if (!event) {
            showNotification('Error', 'Event not found', 'error');
            return;
        }

        // Check if user is registered via result
        if (!regResult.success || !regResult.data?.registration) {
            showNotification('Error', 'You are not registered for this event', 'error');
            return;
        }

        const registration = regResult.data.registration;
        const modal = document.getElementById('eventModal');

        // Use textContent for safe content
        document.getElementById('modalEventTitle').textContent = 'Your Event Ticket';

        const contentContainer = document.getElementById('modalEventContent');
        contentContainer.innerHTML = '';

        const qrContainer = document.createElement('div');
        qrContainer.className = 'qr-code-container';

        const title = document.createElement('h3');
        title.textContent = event.title;
        qrContainer.appendChild(title);

        // Display actual QR code image
        if (registration.qrCode) {
            const qrCodeDiv = document.createElement('div');
            qrCodeDiv.className = 'qr-code';
            const qrImg = document.createElement('img');
            qrImg.src = registration.qrCode;
            qrImg.alt = 'QR Code';
            qrImg.style.maxWidth = '300px';
            qrImg.style.height = 'auto';
            qrCodeDiv.appendChild(qrImg);
            qrContainer.appendChild(qrCodeDiv);
        } else {
            const qrCode = document.createElement('div');
            qrCode.className = 'qr-code';
            const qrEmoji = document.createElement('div');
            qrEmoji.style.fontSize = '80px';
            qrEmoji.textContent = '📱';
            qrCode.appendChild(qrEmoji);
            qrContainer.appendChild(qrCode);
        }

        const ticketId = document.createElement('p');
        const ticketLabel = document.createElement('strong');
        ticketLabel.textContent = 'Ticket ID: ';
        ticketId.appendChild(ticketLabel);
        ticketId.appendChild(document.createTextNode(registration.ticketId || 'RU-TICKET-' + eventId));
        qrContainer.appendChild(ticketId);

        const name = document.createElement('p');
        const nameLabel = document.createElement('strong');
        nameLabel.textContent = 'Name: ';
        name.appendChild(nameLabel);
        name.appendChild(document.createTextNode(currentUser.firstName + ' ' + currentUser.lastName));
        qrContainer.appendChild(name);

        const date = document.createElement('p');
        const dateLabel = document.createElement('strong');
        dateLabel.textContent = 'Date: ';
        date.appendChild(dateLabel);
        date.appendChild(document.createTextNode(new Date(event.date).toLocaleDateString() + ' at ' + event.time));
        qrContainer.appendChild(date);

        const location = document.createElement('p');
        const locationLabel = document.createElement('strong');
        locationLabel.textContent = 'Location: ';
        location.appendChild(locationLabel);
        location.appendChild(document.createTextNode(event.location));
        qrContainer.appendChild(location);

        const instruction = document.createElement('p');
        instruction.style.marginTop = '15px';
        instruction.style.color = '#666';
        instruction.textContent = 'Show this QR code at the event entrance for check-in';
        qrContainer.appendChild(instruction);

        // Add download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn btn-primary';
        downloadBtn.style.marginTop = '15px';
        downloadBtn.textContent = '📥 Download Ticket';
        downloadBtn.onclick = () => downloadTicketImage(eventId, event.title);
        qrContainer.appendChild(downloadBtn);

        contentContainer.appendChild(qrContainer);

        const actions = document.createElement('div');
        actions.className = 'action-buttons';
        actions.style.marginTop = '20px';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn btn-secondary';
        closeBtn.textContent = 'Close';
        closeBtn.onclick = closeModal;
        actions.appendChild(closeBtn);

        contentContainer.appendChild(actions);

        modal.classList.add('active');
    }).catch(error => {
        console.error('Error fetching ticket:', error);
        showNotification('Error', 'Failed to load ticket', 'error');
    });
}

function downloadTicketImage(eventId, eventTitle) {
    try {
        const qrImg = document.querySelector('.qr-code img');
        if (!qrImg) {
            showNotification('Error', 'QR code not found', 'error');
            return;
        }

        // Create a canvas to draw the ticket
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const padding = 20;
        const width = 400;
        const height = 550;

        canvas.width = width;
        canvas.height = height;

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Border
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, width - 10, height - 10);

        // Title
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('EVENT TICKET', width / 2, 40);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(eventTitle, width / 2, 70);

        // Draw the QR code image
        const img = new Image();
        img.onload = function() {
            const qrSize = 250;
            const qrX = (width - qrSize) / 2;
            ctx.drawImage(img, qrX, 100, qrSize, qrSize);

            // Add text below QR code
            ctx.fillStyle = '#999';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Show this code at event entrance', width / 2, 380);

            // User name
            if (currentUser) {
                ctx.fillStyle = '#333';
                ctx.font = 'bold 12px Arial';
                ctx.fillText(currentUser.firstName + ' ' + currentUser.lastName, width / 2, 410);
            }

            // Date generated
            ctx.fillStyle = '#999';
            ctx.font = '10px Arial';
            ctx.fillText('Generated: ' + new Date().toLocaleDateString(), width / 2, 430);

            // Download the canvas as image
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `ticket-${eventTitle.replace(/\\s+/g, '-')}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                showNotification('Success', 'Ticket downloaded successfully', 'success');
            });
        };
        img.src = qrImg.src;
    } catch (error) {
        console.error('Error downloading ticket:', error);
        showNotification('Error', 'Failed to download ticket: ' + error.message, 'error');
    }
}

async function handleCreateEvent() {
    console.log('CREATE EVENT button clicked');
    console.log('Current user:', currentUser);
    console.log('Is authenticated:', isAuthenticated());

    // Check authentication first
    if (!isAuthenticated()) {
        console.log('❌ Not authenticated');
        showNotification('Error', 'You must be logged in to create an event', 'error');
        return;
    }

    // Check authorization - only admin and staff can create events
    if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'staff') {
        console.log('❌ Not authorized. Current role:', currentUser.role);
        showNotification('Error', 'Only administrators and staff can create events', 'error');
        return;
    }

    console.log('✅ Authentication and authorization passed');

    const title = document.getElementById('eventTitle').value.trim();
    const category = document.getElementById('eventCategory').value;
    const description = document.getElementById('eventDescription').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value.trim();
    const capacity = parseInt(document.getElementById('eventCapacity').value);
    const imageFile = document.getElementById('eventImage').files[0];

    console.log('Form values:', { title, category, description, date, time, location, capacity, imageFile });

    // Validate inputs
    if (!title || !description || !date || !time || !location || !capacity) {
        console.log('❌ Validation failed: missing required fields');
        showNotification('Validation Error', 'Please fill in all required fields', 'error');
        return;
    }

    if (title.length < 5) {
        console.log('❌ Validation failed: title too short');
        showNotification('Validation Error', 'Event title must be at least 5 characters', 'error');
        return;
    }

    if (capacity < 1 || capacity > 10000) {
        console.log('❌ Validation failed: invalid capacity');
        showNotification('Validation Error', 'Capacity must be between 1 and 10000', 'error');
        return;
    }

    const eventDate = new Date(date + 'T' + time);
    console.log('Parsed event date:', eventDate);
    if (eventDate < new Date()) {
        console.log('❌ Validation failed: date in past');
        showNotification('Validation Error', 'Event date cannot be in the past', 'error');
        return;
    }

    console.log('✅ All validations passed');
    console.log('About to process event creation...');

    try {
        console.log('Inside try block - about to create eventData object');

        // Call backend API to create event
        const eventData = {
            title: title,
            category: category,
            description: description,
            date: date,
            time: time,
            location: location,
            capacity: capacity
        };

        console.log('eventData object created:', eventData);
        console.log('imageFile value:', imageFile);


        console.log('Checking if imageFile exists...');

        // Handle image upload if provided
        if (imageFile) {
            console.log('📸 Processing image upload...');
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    eventData.image = e.target.result; // Base64 encoded image
                    console.log('📸 Image processed, calling API...');

                    const result = await eventAPI.create(eventData);
                    console.log('📸 API result:', result);

                    if (result.success) {
                        console.log('✅ Event created successfully');
                        closeCreateEventModal();
                        // Clear form
                        document.getElementById('eventTitle').value = '';
                        document.getElementById('eventDescription').value = '';
                        document.getElementById('eventDate').value = '';
                        document.getElementById('eventTime').value = '';
                        document.getElementById('eventLocation').value = '';
                        document.getElementById('eventCapacity').value = '';
                        document.getElementById('eventImage').value = '';

                        updateStats();
                        loadEvents();
                        showNotification('Event Created', title + ' has been created successfully!');
                    } else {
                        console.error('❌ Event creation failed:', result.error);
                        showNotification('Error', result.error || 'Failed to create event', 'error');
                    }
                } catch (error) {
                    console.error('❌ Error in image processing:', error);
                    showNotification('Error', 'Failed to process image: ' + error.message, 'error');
                }
            };
            reader.onerror = (error) => {
                console.error('❌ FileReader error:', error);
                showNotification('Error', 'Failed to read image file', 'error');
            };
            reader.readAsDataURL(imageFile);
        } else {
            // No image - proceed without it
            console.log('📝 No image, calling API directly...');
            const result = await eventAPI.create(eventData);
            console.log('📝 API result:', result);

            if (result.success) {
                console.log('✅ Event created successfully');
                closeCreateEventModal();
                // Clear form
                document.getElementById('eventTitle').value = '';
                document.getElementById('eventDescription').value = '';
                document.getElementById('eventDate').value = '';
                document.getElementById('eventTime').value = '';
                document.getElementById('eventLocation').value = '';
                document.getElementById('eventCapacity').value = '';
                document.getElementById('eventImage').value = '';

                updateStats();
                loadEvents();
                showNotification('Event Created', title + ' has been created successfully!');
            } else {
                console.error('❌ Event creation failed:', result.error);
                showNotification('Error', result.error || 'Failed to create event', 'error');
            }
        }
    } catch (error) {
        console.error('❌ Error in handleCreateEvent:', error);
        showNotification('Error', 'An unexpected error occurred: ' + error.message, 'error');
    }
}
