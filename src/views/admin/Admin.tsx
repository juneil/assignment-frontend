import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import config from '../../aws';
import { Auth } from 'aws-amplify';

import './Admin.scss';

interface Feedback {
    firstname: string;
    lastname: string;
    content: string;
    sentiment: 'good' | 'neutral' | 'bad';
    sentiment_value: number;
}

export function AdminView() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Feedback[]>([]);

    const fetchData = async () => {
        setLoading(true);
        Auth.currentAuthenticatedUser()
            .then((user) =>
                fetch(`${config.API_URL}/feedback`, {
                    method: 'get',
                    headers: {
                        Authorization: 'Bearer ' + user.signInUserSession?.idToken?.jwtToken
                    }
                })
            )
            .then((response) => (response.ok ? response.json() : response.json().then((res) => Promise.reject(new Error(res)))))
            .then((res) => {
                setData(res.feedbacks);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatSentiment = (sentiment: string) => {
        if (sentiment === 'good') {
            return <span className="good"></span>;
        }
    };

    const renderItem = (item: Feedback) => {
        return (
            <Card className="mt-3" title={`${item.firstname} ${item.lastname}`}>
                <div className="grid">
                    <div className="w-9">
                        <p className="m-0">{item.content}</p>
                    </div>
                    <div className="w-3 text-center">
                        <span className={item.sentiment}>{item.sentiment}</span>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <React.Fragment>
            <div className="flex align-items-center justify-content-center mt-8">
                <div className="surface-card p-4 shadow-2 border-round w-full lg:w-4">
                    <div className="text-center mb-5">
                        <div className="text-900 text-3xl font-medium mb-3">Feedbacks</div>
                    </div>

                    {loading && (
                        <div className="text-center">
                            <ProgressSpinner />
                        </div>
                    )}

                    {!loading && <div>{data.map(renderItem)}</div>}
                </div>
            </div>
        </React.Fragment>
    );
}

AdminView.protected = true;
