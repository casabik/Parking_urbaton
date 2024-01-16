import { Box } from "@suid/material";
import { createEffect, createResource, createSignal, onMount } from "solid-js";
import MapGL, { Marker, Source } from "solid-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css'

export default function ({myPos}) {
    const [viewport, setViewport] = createSignal({
        center: myPos(),
        zoom: 11,
    })
    createEffect(() => {
        setViewport({
            center: myPos(),
            zoom: 11
        })
    })
    return (
        <MapGL
            style={{
                width: '100%',
                height: '300px'
            }}
            viewport={viewport()}
            onViewportChange={setViewport}
            options={{
                style: 'mb:basic',
                accessToken: "pk.eyJ1IjoiYmVsZG1pYW4iLCJhIjoiY2xwZDhicmd1MDBndTJpcGJ2Ym1rcnoxbCJ9.-qLfu2JNbEm5Au-Rh0aY9w"
            }}
        >
            <Marker
                lngLat={myPos()}
            ></Marker>
        </MapGL>
    )
}