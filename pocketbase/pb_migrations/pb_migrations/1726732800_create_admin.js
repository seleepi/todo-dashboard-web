// pb_migrations/1726732800_create_admin.js
migrate((db) => {
  // Create admin account
  const adminId = $security.randomString(15)
  const email = "admin@test.com"
  const password = "password123"

  // Hash password using PocketBase's security helper
  const hashedPassword = $security.hashPassword(password)

  // Insert admin into _admins table
  const stmt = db.prepare(`
    INSERT INTO _admins (id, email, passwordHash, created, updated) 
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `)

  stmt.run(adminId, email, hashedPassword)

  console.log("Admin created:", email, "/", password)
}, (db) => {
  // Rollback - remove the admin
  db.exec("DELETE FROM _admins WHERE email = 'admin@test.com'")
})