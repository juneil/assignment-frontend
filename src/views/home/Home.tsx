import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import config from '../../aws';
import './Home.scss';
import { useNavigate } from 'react-router-dom';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { classNames } from 'primereact/utils';

interface Payload {
    firstname: string;
    lastname: string;
    content: string;
}

export function HomeView() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [posted, setPosted] = useState(false);

    const {
        control,
        formState: { isValid },
        handleSubmit,
        reset
    } = useForm<Payload>({
        defaultValues: {
            firstname: '',
            lastname: '',
            content: ''
        }
    });

    const onSubmit: SubmitHandler<Payload> = async (data) => {
        setLoading(true);
        return fetch(`${config.API_URL}/feedback`, {
            method: 'post',
            body: JSON.stringify(data)
        })
            .then((response) => (response.ok ? undefined : response.json().then((res) => Promise.reject(new Error(res)))))
            .then(() => {
                setPosted(true);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    return (
        <React.Fragment>
            <div className="flex align-items-center justify-content-center mt-8">
                <div className="surface-card p-4 shadow-2 border-round w-full lg:w-4">
                    <div className="text-center mb-5">
                        <div className="text-900 text-3xl font-medium mb-3">Your feedback</div>
                        <small>Hydrosat Assignment</small>
                    </div>

                    {posted && (
                        <div>
                            <div className="text-center">
                                <i className="pi pi-check posted"></i>
                            </div>
                            <h5 className="text-center">Thank you, your feedback has been successfully sent.</h5>
                        </div>
                    )}

                    {!posted && (
                        <div>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <label htmlFor="firstname" className="block text-900 font-medium mb-2">
                                    Firstname
                                </label>
                                <Controller
                                    name="firstname"
                                    rules={{ required: 'required.', maxLength: { message: '50 chars max', value: 50 } }}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <InputText
                                                id={field.name}
                                                {...field}
                                                placeholder="Your firstname"
                                                className={classNames({
                                                    'p-invalid': fieldState.invalid,
                                                    'w-full': true,
                                                    'mb-3': true
                                                })}
                                            />
                                            <small className="text-red-500">{fieldState.error?.message}</small>
                                        </>
                                    )}
                                />

                                <label htmlFor="lastname" className="block text-900 font-medium mb-2 mt-3">
                                    Lastname
                                </label>
                                <Controller
                                    name="lastname"
                                    rules={{ required: 'required.', maxLength: { message: '50 chars max', value: 50 } }}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <InputText
                                                id={field.name}
                                                {...field}
                                                placeholder="Your lastname"
                                                className={classNames({
                                                    'p-invalid': fieldState.invalid,
                                                    'w-full': true,
                                                    'mb-3': true
                                                })}
                                            />
                                            <small className="text-red-500">{fieldState.error?.message}</small>
                                        </>
                                    )}
                                />

                                <label htmlFor="content" className="block text-900 font-medium mb-2 mt-3">
                                    Feedback
                                </label>
                                <Controller
                                    name="content"
                                    rules={{ required: 'required.', maxLength: { message: '1000 chars max', value: 1000 } }}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <InputTextarea
                                                id={field.name}
                                                {...field}
                                                placeholder="Your feedback"
                                                rows={10}
                                                className={classNames({
                                                    'p-invalid': fieldState.invalid,
                                                    'w-full': true,
                                                    'mb-3': true
                                                })}
                                            />
                                            <small className="text-red-500">{fieldState.error?.message}</small>
                                        </>
                                    )}
                                />

                                <Button label="Submit" className="mt-5 w-full" disabled={!isValid} loading={loading} />
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </React.Fragment>
    );
}
