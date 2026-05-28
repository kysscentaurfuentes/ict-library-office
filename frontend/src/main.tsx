// frontend/src/main.tsx
import ReactDOM
from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  ApolloProvider,
} from "@apollo/client";

import client
from "./graphql/client.ts";

// =====================================
// RENDER
// =====================================

ReactDOM
  .createRoot(
    document.getElementById(
      "root"
    )!
  )
  .render(

    <ApolloProvider
      client={client}
    >
      <App />
    </ApolloProvider>

  );

/*
=====================================

FOR DEVELOPMENT:
NO React.StrictMode

=====================================

FOR PRODUCTION:

<React.StrictMode>
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
</React.StrictMode>

=====================================
*/