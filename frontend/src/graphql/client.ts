// frontend/src/graphql/client.ts
import {
  ApolloClient,
  InMemoryCache,
  HttpLink
} from '@apollo/client';

const PRIMARY =
  `${import.meta.env.VITE_API_URL}/graphql`;

const FALLBACK =
  `${import.meta.env.VITE_API_FALLBACK}/graphql`;

const client = new ApolloClient({
  link: new HttpLink({
    uri: PRIMARY,
    fetch: async (uri, options) => {

      try {

        // TRY LOCAL FIRST
        const response =
          await fetch(uri, options);

        return response;

      } catch (error) {

        console.warn(
          'Primary backend offline. Using fallback backend...'
        );

        // FALLBACK TO RENDER
        return fetch(
          FALLBACK,
          options
        );
      }
    },
  }),

  cache: new InMemoryCache(),
});

export default client;