import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { Amplify } from 'aws-amplify';
import config from './aws';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import './App.scss';

import { ProtectedRoute } from './views/Protected';
import { HomeView } from './views/home/Home';
import { LoginView } from './views/login/Login';
import { AdminView } from './views/admin/Admin';

Amplify.configure({
    Auth: {
        region: config.REGION,
        userPoolId: config.USER_POOL_ID,
        userPoolWebClientId: config.USER_POOL_APP_CLIENT_ID
    }
});

function checkLayout(Component: ((p?: any) => JSX.Element) & { protected?: boolean }) {
    return (
        <>
            {Component.protected && (
                <ProtectedRoute>
                    <Component />
                </ProtectedRoute>
            )}
            {!Component.protected && <Component />}
        </>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={checkLayout(HomeView)} />
                <Route path="/login" element={checkLayout(LoginView)} />
                <Route path="/admin" element={checkLayout(AdminView)} />
            </Routes>
        </Router>
    );
}

export default App;
