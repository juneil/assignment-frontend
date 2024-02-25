import { Auth } from 'aws-amplify';
import React from 'react';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedRoute = (props: any) => {
    const location = useLocation();
    const [loggedIn, setLoggedIn] = useState<number>(0);

    useEffect(() => {
        async function checkAuth() {
            return Auth.currentUserInfo()
                .then((user) => {
                    if (user) {
                        setLoggedIn(1);
                    } else {
                        setLoggedIn(2);
                    }
                })
                .catch(() => setLoggedIn(2));
        }
        checkAuth();
    });

    return (
        <React.Fragment>
            {loggedIn === 2 && <Navigate to="/login" replace state={{ from: location }} />}
            {loggedIn === 1 && props.children}
        </React.Fragment>
    );
};
