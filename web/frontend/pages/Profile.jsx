import React, { useEffect, useState } from 'react'
import LoginForm from '../components/LoginForm'
import { useSelector } from 'react-redux';
import { ProductsCard } from '../components/ProductsCard';

export default function Profile() {
    const [refresh, setRefresh] = useState(false);
    const JWTTOKEN = useSelector((state) => state.store.Token);
    const [formName, setFormName] = useState("Update Form");


    return (
            <LoginForm
                setRefresh={setRefresh}
                Token={JWTTOKEN}
                formName={formName}
            />

    )
}
