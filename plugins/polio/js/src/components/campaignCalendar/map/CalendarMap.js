import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LoadingSpinner } from 'bluesquare-components';
import { Box } from '@material-ui/core';
import { Map, TileLayer } from 'react-leaflet';
import { useQueries } from 'react-query';
import { getRequest } from 'Iaso/libs/Api';
import { useGetMergedCampaignShapes } from '../../../hooks/useGetMergedCampaignShapes.ts';

import { VaccinesLegend } from './VaccinesLegend';
import { CampaignsLegend } from './CampaignsLegend';
import { appId } from '../../../constants/app';
import { useStyles } from '../Styles';

import 'leaflet/dist/leaflet.css';
import { CalendarMapPanesRegular } from './CalendarMapPanesRegular.tsx';
import { CalendarMapPanesMerged } from './CalendarMapPanesMerged.tsx';
import { defaultViewport, boundariesZoomLimit } from './constants.ts';
import { polioVaccines } from '../../../constants/virus.ts';

const getShapeQuery = (loadingCampaigns, groupId, campaign, vaccine, round) => {
    const baseParams = {
        asLocation: true,
        limit: 3000,
        group: groupId,
        app_id: appId,
    };
    const queryString = new URLSearchParams(baseParams);
    return {
        queryKey: ['campaignShape', baseParams],
        queryFn: () => getRequest(`/api/orgunits/?${queryString.toString()}`),
        select: data => ({
            campaign,
            shapes: data,
            vaccine,
            color: polioVaccines.find(v => v.value === vaccine)?.color,
            round,
        }),
        enabled: !loadingCampaigns,
    };
};

const CalendarMap = ({ campaigns, loadingCampaigns, isPdf }) => {
    const classes = useStyles();
    const [viewport, setViewPort] = useState(defaultViewport);
    const map = useRef();
    const queries = [];
    campaigns.forEach(campaign => {
        if (campaign.separateScopesPerRound) {
            campaign.rounds.forEach(round => {
                round.scopes.forEach(scope => {
                    queries.push(
                        getShapeQuery(
                            loadingCampaigns,
                            scope.group.id,
                            campaign,
                            scope.vaccine,
                            round,
                        ),
                    );
                });
            });
        } else {
            campaign.scopes.forEach(scope => {
                queries.push(
                    getShapeQuery(
                        loadingCampaigns,
                        scope.group.id,
                        campaign,
                        scope.vaccine,
                    ),
                );
            });
        }
    });
    const shapesQueries = useQueries(queries);

    const { data: mergedShapes, isLoading: isLoadingMergedShapes } =
        useGetMergedCampaignShapes().query;

    const campaignColors = {};

    campaigns.forEach(campaign => {
        campaignColors[campaign.id] = campaign.color;
    });
    const campaignIds = campaigns.map(campaign => campaign.id);

    const mergedShapesToDisplay = mergedShapes?.features
        .filter(shape => campaignIds.includes(shape.properties.id))
        .map(shape => {
            return { ...shape, color: campaignColors[shape.properties.id] };
        });

    const loadingShapes =
        viewport.zoom <= 6
            ? isLoadingMergedShapes
            : shapesQueries.some(q => q.isLoading);

    const campaignsShapes = shapesQueries
        .filter(sq => sq.data)
        .map(sq => sq.data);

    return (
        <Box position="relative">
            {(loadingCampaigns || loadingShapes) && <LoadingSpinner absolute />}
            <div className={classes.mapLegend}>
                {viewport.zoom > boundariesZoomLimit && (
                    <CampaignsLegend campaigns={campaigns} />
                )}
                <Box display="flex" justifyContent="flex-end">
                    <VaccinesLegend />
                </Box>
            </div>
            <Map
                zoomSnap={0.25}
                ref={map}
                style={{
                    height: !isPdf ? '72vh' : '800px',
                }}
                center={viewport.center}
                zoom={viewport.zoom}
                scrollWheelZoom={false}
                onViewportChanged={v => setViewPort(v)}
            >
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {viewport.zoom > 6 && (
                    <CalendarMapPanesRegular
                        campaignsShapes={campaignsShapes}
                        viewport={viewport}
                    />
                )}
                {viewport.zoom <= 6 && (
                    <CalendarMapPanesMerged
                        mergedShapes={mergedShapesToDisplay}
                        viewport={viewport}
                    />
                )}
            </Map>
        </Box>
    );
};

CalendarMap.defaultProps = {
    isPdf: false,
};

CalendarMap.propTypes = {
    campaigns: PropTypes.array.isRequired,
    loadingCampaigns: PropTypes.bool.isRequired,
    isPdf: PropTypes.bool,
};

export { CalendarMap };
