import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import React, { useEffect, useMemo, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { geoJSON } from 'leaflet';

export const MapComponent = ({ onSelectShape, shapes, getShapeStyle }) => {
    const map = useRef();

    // When there is no data, bounds is undefined, so default center and zoom is used,
    // when the data get there, bounds change and the effect focus on it via the deps
    const bounds = useMemo(() => {
        if (!shapes || shapes.length === 0) {
            return null;
        }
        const bounds_list = shapes
            .map(orgunit => geoJSON(orgunit.geo_json).getBounds())
            .filter(b => b !== undefined);
        if (bounds_list.length === 0) {
            return null;
        }
        const newBounds = bounds_list[0];
        newBounds.extend(bounds_list);
        return newBounds;
    }, [shapes]);

    useEffect(() => {
        if (bounds && bounds.isValid()) {
            map.current?.leafletElement.fitBounds(bounds);
        }
    }, [bounds]);

    return (
        <Map
            ref={map}
            style={{ height: 500 }}
            center={[0, 0]}
            zoom={3}
            scrollWheelZoom={false}
            bounds={bounds}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {shapes &&
                shapes.map(shape => (
                    <GeoJSON
                        key={shape.id}
                        data={shape.geo_json}
                        style={() => getShapeStyle(shape)}
                        onClick={() => onSelectShape(shape)}
                    />
                ))}
        </Map>
    );
};