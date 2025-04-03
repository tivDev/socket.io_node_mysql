const db = require('../models/db');

module.exports = (io, socket) => {
    console.log('User connected:', socket.id);

    // Send user list to the client
    db.query('SELECT id, name FROM user', (err, results) => {
        if (!err) {
            socket.emit('userList', results);
        } else {
            socket.emit('dataError', 'Failed to fetch user list.');
        }
    });

    // Add new user to MySQL
    socket.on('addUser', (userName) => {
        if (userName.trim()) {
            db.query('INSERT INTO user (name) VALUES (?)', [userName], (err, result) => {
                if (!err) {
                    const newUser = { id: result.insertId, name: userName };
                    io.emit('newUser', newUser);
                } else {
                    socket.emit('dataError', 'Failed to add user.');
                }
            });
        }
    });

    // Edit user in MySQL
    socket.on('editUser', ({ id, name }) => {
        db.query('UPDATE user SET name = ? WHERE id = ?', [name, id], (err) => {
            if (!err) {
                db.query('SELECT id, name FROM user', (err, results) => {
                    if (!err) {
                        io.emit('updateUserList', results);
                    } else {
                        socket.emit('dataError', 'Failed to fetch updated user list.');
                    }
                });
            } else {
                socket.emit('dataError', 'Failed to edit user.');
            }
        });
    });

    // Delete user from MySQL
    socket.on('deleteUser', (id) => {
        db.query('DELETE FROM user WHERE id = ?', [id], (err) => {
            if (!err) {
                db.query('SELECT id, name FROM user', (err, results) => {
                    if (!err) {
                        io.emit('updateUserList', results);
                    } else {
                        socket.emit('dataError', 'Failed to fetch updated user list.');
                    }
                });
            } else {
                socket.emit('dataError', 'Failed to delete user.');
            }
        });
    });

    // Handle request for updated user list
    socket.on('requestUserList', () => {
        db.query('SELECT id, name FROM user', (err, results) => {
            if (!err) {
                socket.emit('userList', results);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
};
