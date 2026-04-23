// display-client/src/App.tsx
import { useEffect } from "react";
import axios from "axios";
import { Helmet, HelmetProvider } from "react-helmet-async";
function App() {
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/data")
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <HelmetProvider>
    <div>
      <Helmet>
      <title>ICT LIBRARY OFFICE Scanner Display</title>
      </Helmet>
      <h1>Scanner Output</h1>
    </div>
    </HelmetProvider>
  );
}

export default App;