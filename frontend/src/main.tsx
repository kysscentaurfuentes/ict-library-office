import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import {
  ApolloClient,
  InMemoryCache,
  HttpLink
} from '@apollo/client'

import { ApolloProvider } from '@apollo/client/react'
import { setContext } from '@apollo/client/link/context'

// 🔥 Dynamic API URL
// 🔗 HTTP connection
const PRIMARY =
  `${import.meta.env.VITE_API_URL}/graphql`;

const FALLBACK =
  `${import.meta.env.VITE_API_FALLBACK}/graphql`;

const httpLink = new HttpLink({
  uri: PRIMARY,

  fetch: async (uri, options) => {

    try {

      return await fetch(
        uri,
        options
      );

    } catch (error) {

      console.warn(
        'Primary backend offline. Using fallback backend...'
      );

      return fetch(
        FALLBACK,
        options
      );
    }
  },
});

// 🔐 Auth middleware
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');

  return {
    headers: {
      ...headers,
      authorization: token
        ? `Bearer ${token}`
        : '',
    },
  };
});

// 🚀 Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

ReactDOM
  .createRoot(document.getElementById('root')!)
  .render(
    <React.StrictMode>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </React.StrictMode>
  );