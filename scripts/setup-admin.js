const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Try loading service account key
let serviceAccount = null;
const keyPath = path.join(__dirname, 'service-account-key.json');

if (fs.existsSync(keyPath)) {
  serviceAccount = require(keyPath);
} else {
  console.warn('⚠️ No service-account-key.json found. Attempting to use environment variables...');
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var as JSON');
    }
  }
}

if (!serviceAccount && !process.env.FIREBASE_CONFIG) {
  console.error('❌ Error: Firebase credentials are required. Place service-account-key.json in the scripts/ folder.');
  process.exit(1);
}

admin.initializeApp({
  credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault()
});

const auth = admin.auth();
const db = admin.firestore();

async function setupAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kcetplanner.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  
  try {
    console.log(`🔧 Setting up admin user: ${adminEmail}`);
    
    // Check if user exists
    let user;
    try {
      user = await auth.getUserByEmail(adminEmail);
      console.log('✅ User exists');
    } catch (error) {
      // Create user if doesn't exist
      console.log('👤 Creating new admin user...');
      user = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'KCET Admin'
      });
      console.log('✅ Admin user created');
    }
    
    // Set custom claims
    await auth.setCustomUserClaims(user.uid, {
      role: 'admin',
      permissions: ['read', 'write', 'delete']
    });
    console.log('✅ Admin claims set');
    
    // Create Firestore document for admin
    await db.collection('admins').doc(user.uid).set({
      email: adminEmail,
      role: 'admin',
      createdAt: new Date().toISOString(),
      permissions: ['read', 'write', 'delete']
    }, { merge: true });
    console.log('✅ Admin Firestore document created');
    
    console.log('\n🎉 Admin setup complete!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log('🔑 Password: [The password you set/default]');
    console.log('⚠️  Please login and change the password immediately.');
    
  } catch (error) {
    console.error('❌ Admin setup failed:', error);
  }
}

// Run
setupAdmin();
