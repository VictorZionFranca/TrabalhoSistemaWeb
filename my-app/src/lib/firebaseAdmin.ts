// src/lib/firebaseAdmin.ts
import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../app/api/users/serviceAccountKey.json'; // Altere o caminho conforme necessário

// Assegure-se de que o objeto seja do tipo ServiceAccount
const serviceAccountTyped: ServiceAccount = serviceAccount as ServiceAccount;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountTyped), // Use o objeto tipado aqui
    });
}

export const auth = admin.auth();
