import { useNavigate } from '@solidjs/router'
import { Typography, Grid, TextField, Stack, Button, Link } from '@suid/material'
import { createSignal } from 'solid-js'

export default function() {
    const [username, setUsername] = createSignal('')
    const [password, setPassword] = createSignal('')
    const navigate = useNavigate()

    const login_user = async () => {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                login: username(),
                password: password()
            })
        })
        const data = await response.json()
        console.log(data)
        localStorage.setItem('access_token', data.token)
        navigate('/')
    }

    return (
        <Grid container alignItems='center' justifyContent='center' sx={{height: '100vh'}}>
            <Stack spacing={2} sx={{width: "min(300px, 100%)"}}>
                <Typography variant='h3'>Вход</Typography>
                <TextField value={username()} onChange={e => setUsername(e.target.value)} label="Имя пользователя" type='text'/>
                <TextField value={password()} onChange={e => setPassword(e.target.value)} label="Пароль" type='password'/>
                <Button variant='contained' onClick={login_user}>Войти</Button>
                <Typography variant='body1'>
                    <Link href="/registration">Регистрация</Link>
                </Typography>
            </Stack>
        </Grid>
    )
}