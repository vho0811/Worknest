// Test Firebase Storage upload
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBRiLWeQXeona1ktnOsgx2Zm8V894sW6h0",
  authDomain: "worknest-73437.firebaseapp.com",
  projectId: "worknest-73437",
  storageBucket: "worknest-73437.firebasestorage.app",
  messagingSenderId: "426239719525",
  appId: "1:426239719525:web:17efab9bb6db7717e26e8c",
  measurementId: "G-TB7YRBE5BB"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Test upload function
async function testUpload() {
  try {
    // Create a test file
    const testContent = 'Hello Firebase Storage!';
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    
    const timestamp = Date.now();
    const fileName = `test_${timestamp}.txt`;
    const storageRef = ref(storage, `uploads/${fileName}`);
    
    console.log('Uploading test file...');
    const snapshot = await uploadBytes(storageRef, testFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Upload successful!');
    console.log('Download URL:', downloadURL);
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
}

testUpload(); 