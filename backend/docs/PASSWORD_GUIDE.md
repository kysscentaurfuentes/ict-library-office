# Password Change Guide
## Generate bcrypt hash

OR
```bash
node scripts/hash-password.js YOUR_PASSWORD

then update user in database:
UPDATE users
SET password = 'PASTE_HASH_HERE'
WHERE "StudentId" = '211-01850';