import { Typography, Button, Modal, Box, TextField, Stack, List, ListItem } from '@suid/material'
import { Add } from '@suid/icons-material'
import useTheme from "@suid/material/styles/useTheme";
import { createSignal, onMount } from 'solid-js'
import StreetSearch from './StreetSearch';

export default function () {
    const [places, setPlaces] = createSignal([])
    const [open, setOpen] = createSignal(false)
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const [newName, setNewName] = createSignal("")
    const [newAddress, setNewAddress] = createSignal("")
    const [newCoords, setNewCoords] = createSignal([0,0])

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
    onMount(fetch_places)

    const addNewPlace = async () => {
        await fetch(`http://localhost:8000/create_place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('access_token'),
            },
            body: JSON.stringify({
                name: newName(),
                latitude: newCoords()[0],
                longitude: newCoords()[1],
            })
        })
        handleClose()
        setNewName("")
        setNewAddress("")
        setNewCoords([0,0])
        await fetch_places()
    }

    const theme = useTheme();

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
                        <Typography variant='h5'>Добавление места</Typography>
                        <TextField label="Название" value={newName()} onChange={e => setNewName(e.target.value)} />
                        <StreetSearch setAddress={setNewAddress} setCoords={setNewCoords}/>
                        <Button variant='contained' onClick={addNewPlace}>Добавить</Button>
                    </Stack>
                </Box>
            </Modal>
            <Typography variant='h4'>Ваши места</Typography>
            <List>
                {places().map(place => (
                    <ListItem>
                        <Stack>
                            <Typography variant='h6'>{place.name}</Typography>
                            <Typography variant='body2' color='GrayText'>{place.longitude}, {place.latitude}</Typography>
                        </Stack>
                    </ListItem>
                ))}
            </List>
            <Button
                onClick={handleOpen}
                startIcon={<Add />}
                variant='contained'
            >Добавить место</Button>
        </>
    )
}