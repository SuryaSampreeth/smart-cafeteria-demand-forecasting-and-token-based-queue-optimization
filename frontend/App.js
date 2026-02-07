import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';


export default function App() {
  return (
    // Wrap app with Auth Context for global user state
    <AuthProvider>
      {/* Main navigation container */}
      <AppNavigator />

      {/* Auto-style status bar based on theme */}
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
