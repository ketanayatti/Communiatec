// Initializes a MongoDB user for the communiatec_chat database
// Credentials must match the DATABASE_URL in docker-compose.yml

// Ensure application database exists
db = db.getSiblingDB("communiatec_chat");

db.createUser({
  user: "admin",
  pwd: "communiatec_secure_password",
  roles: [{ role: "readWrite", db: "communiatec_chat" }],
});

print("✅ Mongo: communiatec_chat user initialized");
