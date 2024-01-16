import { Typography, Stack, List, ListItem, ListItemButton, ListItemText } from '@suid/material'
import { createEffect, createSignal } from 'solid-js'

export default function ({ books, myPos }) {
    return (
        <>
            <Stack spacing={1}>
                <Typography variant='h4'>Активные бронирования</Typography>
                {books() && books().length === 0 ?
                    (<Typography variant='body1'>Бронирований пока нет</Typography>) :
                    (
                        <List>
                            {books() && books().map(book => (
                                <ListItem disablePadding>
                                    <ListItemButton component="a" target="_blank" href={`https://yandex.ru/maps?mode=routes&rtext=${myPos()[1]},${myPos()[0]}~${book.longitude},${book.latitude}`}>
                                        <ListItemText primary={`${book.start_date} - ${book.end_date}`} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
            </Stack>
        </>
    )
}