import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';

export function LoginView() {
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [view, setView] = useState('login');
    const [user, setUser] = useState();
    const [loggedIn, setLoggedIn] = useState<number>(0);
    const [error, setError] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            return Auth.currentAuthenticatedUser()
                .then(() => setLoggedIn(1))
                .catch(() => setLoggedIn(2));
        }
        checkAuth();
    });

    async function signIn(email: string, password: string) {
        console.log(email, password);
        setButtonDisabled(true);
        return Auth.signIn(email, password)
            .then((user) => {
                setUser(user);
                // In this assignment I dont handle new password.
                // I make it simple
                if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                    setError(true);
                }
            })
            .catch(() => {
                setButtonDisabled(false);
                setError(true);
            });
    }

    const loginView = () => (
        <div className="flex align-items-center justify-content-center mt-8">
            <div className="surface-card p-4 shadow-2 border-round w-full lg:w-4">
                <div className="text-center mb-5">
                    <div className="text-900 text-3xl font-medium mb-3">Your feedback</div>
                    <small>Hydrosat Assignment</small>
                </div>

                <div>
                    <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
                        Email
                    </label>
                    <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="text" className="w-full" />

                    <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                        Password
                    </label>
                    <Password
                        inputId="password"
                        value={password}
                        feedback={false}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mb-5"
                        inputClassName="w-full"
                    ></Password>

                    <Button
                        label="Sign in"
                        className="w-full p-3 text-xl"
                        onClick={() => signIn(email, password)}
                        disabled={buttonDisabled}
                    ></Button>
                    <div className="flex flex-column align-items-center justify-content-center">
                        {error && <Message severity="error" text="Authentication failed" style={{ marginTop: 20 }} />}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <React.Fragment>
            {loggedIn === 1 && <Navigate to="/admin" replace state={{ from: location }} />}
            {loggedIn === 2 && view === 'login' && loginView()}
        </React.Fragment>
    );
}
