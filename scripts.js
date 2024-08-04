// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// User Registration
document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('User registered:', userCredential.user);
        })
        .catch(error => {
            console.error('Error during registration:', error);
        });
});

// User Login
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('User logged in:', userCredential.user);
        })
        .catch(error => {
            console.error('Error during login:', error);
        });
});

// Add Product (Admin)
document.getElementById('product-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const productName = document.getElementById('product-name').value;
    const productPrice = document.getElementById('product-price').value;
    db.collection('products').add({
        name: productName,
        price: productPrice,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(docRef => {
        console.log('Product added:', docRef.id);
    })
    .catch(error => {
        console.error('Error adding product:', error);
    });
});

// Display Products
function displayProducts() {
    const productList = document.getElementById('product-list');
    db.collection('products').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const product = doc.data();
            const productItem = document.createElement('div');
            productItem.innerHTML = `
                <h3>${product.name}</h3>
                <p>${product.price}</p>
                <button onclick="addToCart('${doc.id}')">Add to Cart</button>
            `;
            productList.appendChild(productItem);
        });
    });
}
displayProducts();

// Add to Cart
function addToCart(productId) {
    const userId = auth.currentUser.uid;
    db.collection('carts').doc(userId).set({
        [productId]: firebase.firestore.FieldValue.increment(1)
    }, { merge: true });
}

// Place Order
document.getElementById('place-order')?.addEventListener('click', () => {
    const userId = auth.currentUser.uid;
    db.collection('carts').doc(userId).get().then(doc => {
        const cart = doc.data();
        db.collection('orders').add({
            userId: userId,
            products: cart,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(docRef => {
            console.log('Order placed:', docRef.id);
            db.collection('carts').doc(userId).delete();
        })
        .catch(error => {
            console.error('Error placing order:', error);
        });
    });
});

// Log every action
function logAction(action) {
    db.collection('logs').add({
        action: action,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(docRef => {
        console.log('Action logged:', docRef.id);
    })
    .catch(error => {
        console.error('Error logging action:', error);
    });
}

// Example usage
logAction('User registered');
logAction('Product added to cart');
