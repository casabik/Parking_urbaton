import { Box, Fab, Stack, Modal, Typography, List, ListItem, ListItemButton, ListItemText, TextField, Select, MenuItem } from '@suid/material'
import { Add } from '@suid/icons-material'
import useTheme from "@suid/material/styles/useTheme";
import { createEffect, createMemo, createResource, createSignal, onMount } from 'solid-js'
import parkings_test from '../parkings_test';
import { calcCrow } from '../scripts/distance';

export default function ({ refetchBooks, myPos }) {
    const [open, setOpen] = createSignal(false)
    const [pos, setPos] = createSignal([0, 0])
    createEffect(() => {
        setPos(myPos())
    })
    const handleClose = () => setOpen(false)
    const [startTime, setStartTime] = createSignal(`${new Date().getMinutes() > 30 ? new Date().getHours() + 1: new Date().getHours()}:00`)
    const [duration, setDuration] = createSignal(1)

    const createBooking = async (parking_id) => {
        const startTimeParsed = new Date()
        startTimeParsed.setHours(parseInt(startTime().split(':')[0]))
        startTimeParsed.setMinutes(parseInt(startTime().split(':')[1]))
        startTimeParsed.setSeconds(0)
        const endTimeParsed = new Date(startTimeParsed)
        endTimeParsed.setHours(startTimeParsed.getHours() + duration())
        await fetch(`http://localhost:8000/book_place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('access_token'),
            },
            body: JSON.stringify({
                start_date: `${startTimeParsed.getFullYear()}-${startTimeParsed.getMonth()}-${startTimeParsed.getDate()} ${startTimeParsed.getHours()}:${startTimeParsed.getMinutes()}:00`,
                end_time: `${endTimeParsed.getFullYear()}-${endTimeParsed.getMonth()}-${endTimeParsed.getDate()} ${endTimeParsed.getHours()}:${endTimeParsed.getMinutes()}:00`,
                parking_id: parking_id,
                numper_spaces: 1
            })
        })
        refetchBooks()
    }

    const [places, setPlaces] = createSignal([])
    const [searchPlace, setSearchPlace] = createSignal(-1)
    
    const fetch_places = async () => {
        const response = await fetch(`http://localhost:8000/get_places`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('access_token'),
            },
        })
        const data = await response.json()
        setPlaces(data.places)
    } 
    onMount(async () => {
        await fetch_places()
    })
    const theme = useTheme();
    const fetcherOptions = createMemo(() => {
        const startTimeParsed = new Date()
        startTimeParsed.setHours(parseInt(startTime().split(':')[0]))
        startTimeParsed.setMinutes(parseInt(startTime().split(':')[1]))
        startTimeParsed.setSeconds(0)
        const endTimeParsed = new Date(startTimeParsed)
        endTimeParsed.setHours(startTimeParsed.getHours() + duration())

        const start_time = `${startTimeParsed.getFullYear()}-${startTimeParsed.getMonth()}-${startTimeParsed.getDate()} ${startTimeParsed.getHours()}:${startTimeParsed.getMinutes()}:00`
        const end_time = `${endTimeParsed.getFullYear()}-${endTimeParsed.getMonth()}-${endTimeParsed.getDate()} ${endTimeParsed.getHours()}:${endTimeParsed.getMinutes()}:00`

        const place = searchPlace() == -1 ? null : places()[searchPlace()]
        const place_coords = searchPlace() == -1 ? [myPos()[1], myPos()[0]] : [place.latitude, place.longitude]
        return {start_time: start_time, end_time: end_time, latitude: place_coords[1], longitude: place_coords[0]}
    })
    const parkings_fetcher = async (options) => {
        const response = await fetch(`http://localhost:8000/get_nearest_parkings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('access_token'),
            },
            body: JSON.stringify(options)
        })
        const data = await response.json()
        return data.parkings
    }
    const [parkings] = createResource(fetcherOptions, parkings_fetcher)

    return (
        <>
            <Modal
                open={open()}
                onClose={handleClose}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: theme.palette.background.paper,
                        borderRadius: "24px",
                        boxShadow: "24px",
                        p: 4,
                    }}
                >
                    <Stack spacing={1}>
                        <Typography variant='h5'>Бронирование парковки</Typography>
                        <Typography variant='h6'>Ближайшее место</Typography>
                        <Select onChange={(e) => setSearchPlace(e.target.value)} value={searchPlace()}>
                            <MenuItem value={-1}>Текущее местоположение</MenuItem>
                            {places().map((place, i) => (
                                <MenuItem value={i}>{place.name}</MenuItem>
                            ))}
                        </Select>
                        <Typography variant='h6'>Временной промежуток</Typography>
                        <TextField type="time" onChange={(e) => setStartTime(e.target.value)} value={startTime()}/>
                        <Select onChange={(e) => setDuration(e.target.value)} value={duration()}>
                            <MenuItem value={1} selected>На 1 час</MenuItem>
                            <MenuItem value={2}>На 2 часа</MenuItem>
                            <MenuItem value={3}>На 3 часа</MenuItem>
                            <MenuItem value={5}>На 5 часов</MenuItem>
                            <MenuItem value={8}>На 8 часов</MenuItem>
                        </Select>
                        <Typography variant='h6'>Варианты парковок</Typography>
                        <List>
                            {parkings() && parkings().map((parking) => (
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => {
                                        setOpen(false)
                                        createBooking(parking.parking_id)
                                    }}>
                                        <ListItemText primary={`Парковка #${parking.parking_id}`} secondary={`${Math.round(parking.lenght*1000)/1000} км`}/>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Stack>
                </Box>
            </Modal>
            <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
                <Fab color="primary" variant='extended' onClick={() => setOpen(true)}>
                    <Add sx={{ mr: 1 }} />
                    Бронирование
                </Fab>
            </Box>
        </>
    )
}