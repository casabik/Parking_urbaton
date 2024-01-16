import { Grid, Typography, Card, CardContent, Box, Fab } from '@suid/material'
import {Add} from '@suid/icons-material'
import Places from '../components/Places'
import Books from '../components/Books'
import Map from '../components/Map'
import CreateBookFAB from '../components/CreateBookFAB'
import { createResource, createSignal, onMount } from 'solid-js'

export default function() {
    const [myPos, setMyPos] = createSignal([0, 0])
    onMount(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setMyPos([pos.coords.longitude, pos.coords.latitude])
            })
        }
    })
    const [books, {refetch}] = createResource(async () => {
        const response = await fetch('http://localhost:8000/get_bookings', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('access_token'),
            },
        })
        const data = await response.json()
        console.log(data)
        return data.bookings
    })
    return (
        <>
            <Grid container spacing={2} p={2}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Places default_places={[{'name': 'Дом', 'address': 'улица Дениса Давыдова, 9, посёлок ВНИИССОК, Одинцовский городской округ, Московская область, 143080'}]}/>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Books books={books} myPos={myPos}/>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card sx={{padding: 0}}>
                        <CardContent sx={{padding: 0, "&:last-child": {padding: 0}}}>
                            <Map myPos={myPos}/>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <CreateBookFAB myPos={myPos} refetchBooks={refetch}/>
        </>
    )
}