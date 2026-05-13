import bcrypt from 'bcrypt';

const password = process.argv[2];

if (!password) {
  console.log('Usage: npm run hash YOUR_PASSWORD');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);

console.log('\nPASSWORD:', password);
console.log('\nHASH:\n');
console.log(hash);

// Instructions:

// In backend terminal Run:
// .\scripts\change-password.bat

// OR

// In backend terminal Run:
// npm run hash "YOUR_PASSWORD_HERE"