import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(HelmetProvider, { children: _jsxs("div", { children: [_jsx(Helmet, { children: _jsx("title", { children: "ICT LIBRARY OFFICE Scanner Display" }) }), _jsx("h1", { children: "Scanner Output" })] }) }));
}
export default App;
