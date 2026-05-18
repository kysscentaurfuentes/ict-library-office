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
const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_FALLBACK;

// 🔗 HTTP connection
const httpLink = new HttpLink({
  uri: `${API_URL}/graphql`,
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