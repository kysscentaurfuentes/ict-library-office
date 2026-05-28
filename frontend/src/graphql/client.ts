// frontend/src/graphql/client.ts
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";

import { setContext }
from "@apollo/client/link/context";

// =====================================
// API URLS
// =====================================

const PRIMARY =
  "http://localhost:4000/graphql";

const FALLBACK =
  `${import.meta.env.VITE_API_FALLBACK}/graphql`;

// =====================================
// HTTP LINK
// =====================================

const httpLink =
  new HttpLink({

    uri: PRIMARY,

    fetch: async (
      uri,
      options
    ) => {

      try {

        return await fetch(
          uri,
          options
        );

      } catch (error) {

        console.warn(
          "Primary backend offline. Using fallback backend..."
        );

        return fetch(
          FALLBACK,
          options
        );
      }
    },
  });

// =====================================
// AUTH LINK
// =====================================

const authLink =
  setContext(
    (_, { headers }) => {

      const token =
        localStorage.getItem(
          "token"
        );

      return {

        headers: {

          ...headers,

          authorization:
            token
              ? `Bearer ${token}`
              : "",
        },
      };
    }
  );

// =====================================
// APOLLO CLIENT
// =====================================

const client =
  new ApolloClient({

    link:
      authLink.concat(
        httpLink
      ),

    cache:
      new InMemoryCache(),

    defaultOptions: {

      watchQuery: {

        fetchPolicy:
          "cache-first",

        errorPolicy:
          "all",
      },

      query: {

        fetchPolicy:
          "cache-first",

        errorPolicy:
          "all",
      },
    },
  });

export default client;