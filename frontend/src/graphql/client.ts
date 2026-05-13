// frontend/src/graphql/client.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
  uri: 'https://ict-library-office-backend.onrender.com/graphql',
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
}),
  cache: new InMemoryCache(),
});

export default client;