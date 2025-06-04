const bcrypt = require('bcryptjs');
const saltRounds = 10; // El "cost factor"
const plainPassword = 'admin123'; // La contraseña que quieres usar

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log("Plain password:", plainPassword);
    console.log("Generated hash:", hash);
});
