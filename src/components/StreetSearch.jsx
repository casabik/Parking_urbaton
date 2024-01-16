import { Select, createOptions } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";
import './StreetSearch.css'
import { Typography } from "@suid/material";
import { createResource, createSignal, onMount } from "solid-js";

export default function({setAddress, setCoords}) {
    const [props, setProps] = createSignal(createOptions([]))
    const [query, setQuery] = createSignal('')
    createResource(query, async (q) => {
        const response = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${q}&format=jsonv2`)
        const data = await response.json()
        if (data == null || data == undefined || data.length == 0) {
            return 
        }
        setProps(createOptions(data, {"key": "display_name"}))
        console.log(createOptions(data, {"key": "display_name"}))
    })
    return (
        <Typography variant="body1">
            <Select
                onChange={(e) => {
                    setAddress(e.display_name)
                    setCoords([e.lat, e.lon])
                }}
                onInput={(inp) => setQuery(inp)}
                placeholder="Адрес"
                class="custom"
                {...props()}
            />
        </Typography>
    )
}