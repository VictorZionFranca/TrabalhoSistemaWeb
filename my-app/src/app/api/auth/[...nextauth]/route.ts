// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Importa a instância de autenticação do Firebase

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Verifica se as credenciais foram fornecidas
        if (!credentials) {
          throw new Error('No credentials provided');
        }

        try {
          // Tenta autenticar o usuário com Firebase
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );

          // Retorna o usuário autenticado
          return {
            id: userCredential.user.uid,
            email: userCredential.user.email,
          };
        } catch (error) {
          console.error('Error during sign-in:', error);
          return null; // Retorna null se houve erro na autenticação
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Usa JWT para gerenciar sessões
  },
  
  callbacks: {
    async session({ session, token }) {
      // Adiciona o ID do usuário ao objeto de sessão
      if (token && session.user) {
        session.user.id = token.sub || '';
      }
      return session;
    },
    async jwt({ token, user }) {
      // Adiciona o ID do usuário ao token JWT
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET, // Define a chave secreta para JWT
});

// Exporta o handler como métodos GET e POST
export { handler as GET, handler as POST };
