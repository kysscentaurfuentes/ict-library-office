// display-client/src/App.tsx
import { useEffect } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import axios from "axios";
import { Helmet, HelmetProvider } from "react-helmet-async";
function App() {
    useEffect(() => {
        axios
            .get("http://192.168.8.156:4000/api/data")
            .then((res) => console.log(res.data))
            .catch((err) => console.error(err));
    }, []);
    return (_jsx(HelmetProvider, { children: _jsxs("div", { children: [_jsx(Helmet, { children: _jsx("title", { children: "ICT LIBRARY OFFICE Scanner Display" }) }), _jsx("h1", { children: "Scanner Output" })] }) }));
}
export default App;
