const socket = io();
let userIdToDelete = null;

// Function to render the user list and attach event listeners
function renderUserList(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>
                <button class="btn btn-primary btn-sm edit-btn" data-id="${user.id}" data-name="${user.name}">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${user.id}">Delete</button>
            </td>
        `;
        userList.appendChild(row);
    });

    // Attach event listeners for edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-id');
            const userName = button.getAttribute('data-name');
            document.getElementById('editUserId').value = userId;
            document.getElementById('editUserName').value = userName;
            const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
            editUserModal.show();
        });
    });

    // Attach event listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            userIdToDelete = button.getAttribute('data-id');
            const deleteUserModal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
            deleteUserModal.show();
        });
    });
}

// Update user list on initial load
socket.on('userList', (users) => {
    renderUserList(users);
});

// Add new user to the table in real-time
socket.on('newUser', (user) => {
    socket.emit('requestUserList'); // Request the updated user list
});

// Handle user edit and delete updates in real-time
socket.on('updateUserList', (users) => {
    renderUserList(users);
});

// Add user button click event
document.getElementById('addUserButton').addEventListener('click', () => {
    const userNameInput = document.getElementById('userNameInput');
    const userName = userNameInput.value.trim();

    if (userName) {
        socket.emit('addUser', userName);
        userNameInput.value = ''; // Clear the input field
    } else {
        alert('Please enter a valid user name.');
    }
});

// Save changes in the edit modal
document.getElementById('saveEditButton').addEventListener('click', () => {
    const userId = document.getElementById('editUserId').value;
    const userName = document.getElementById('editUserName').value.trim();

    if (userName) {
        socket.emit('editUser', { id: userId, name: userName });
        const editUserModal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        editUserModal.hide();
    }
});

// Confirm delete in the delete modal
document.getElementById('confirmDeleteButton').addEventListener('click', () => {
    if (userIdToDelete) {
        socket.emit('deleteUser', userIdToDelete);
        userIdToDelete = null;
        const deleteUserModal = bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'));
        deleteUserModal.hide();
    }
});

// Handle socket connection error
socket.on('connect_error', () => {
    alert('Failed to connect to the server. Please check your connection.');
});

// Handle socket disconnection
socket.on('disconnect', () => {
    alert('Disconnected from the server. Please refresh the page or check your connection.');
});

// Handle data errors
socket.on('dataError', (errorMessage) => {
    const errorContainer = document.getElementById('errorContainer');
    if (!errorContainer) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'errorContainer';
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.textContent = errorMessage;
        document.body.prepend(errorDiv);
    } else {
        errorContainer.textContent = errorMessage;
    }
});
