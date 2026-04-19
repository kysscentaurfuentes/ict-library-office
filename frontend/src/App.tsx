// frontend/src/App.tsx
import AppRouter from './routes/AppRouter';
import { PCProvider } from './context/PCContext';

export default function App() {
  return (
    <PCProvider>
      <AppRouter />
    </PCProvider>
  );
}