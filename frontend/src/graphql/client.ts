// frontend/src/graphql/client.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
  uri: 'https://dioxide-gibberish-enforcer.ngrok-free.dev/graphql',
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
}),
  cache: new InMemoryCache(),
});

export default client;