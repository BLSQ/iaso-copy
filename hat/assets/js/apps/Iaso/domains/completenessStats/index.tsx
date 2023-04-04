import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useSafeIntl, commonStyles } from 'bluesquare-components';
import { Box, Grid, makeStyles } from '@material-ui/core';
import { TableWithDeepLink } from '../../components/tables/TableWithDeepLink';
import { baseUrls } from '../../constants/urls';
import { redirectTo } from '../../routing/actions';
import {
    buildQueryString,
    useGetCompletenessStats,
} from './hooks/api/useGetCompletnessStats';
import { useCompletenessStatsColumns } from './hooks/useCompletenessStatsColumns';
import TopBar from '../../components/nav/TopBarComponent';
import MESSAGES from './messages';
import { MENU_HEIGHT_WITHOUT_TABS } from '../../constants/uiConstants';
import { CompletenessStatsFilters } from './CompletenessStatsFilters';
import { CsvButton } from '../../components/Buttons/CsvButton';
import { CompletenessRouterParams } from './types';

const baseUrl = baseUrls.completenessStats;
const useStyles = makeStyles(theme => ({
    ...commonStyles(theme),
    container: {
        height: `calc(100vh - ${MENU_HEIGHT_WITHOUT_TABS}px)`,
        overflow: 'auto',
    },
}));

type Props = {
    params: CompletenessRouterParams;
};

// Used to show the requested orgunit prominently.
const getRowStyles = ({ original }) => {
    if (original?.is_root) {
        return {
            style: {
                backgroundColor: '#b1e5e5',
            },
        };
    }
    return {};
};

export const CompletessStats: FunctionComponent<Props> = ({ params }) => {
    const classes: Record<string, string> = useStyles();
    const dispatch = useDispatch();
    const { formatMessage } = useSafeIntl();
    const { data: completenessStats, isFetching } =
        useGetCompletenessStats(params);
    const columns = useCompletenessStatsColumns(params, completenessStats);
    const csvUrl = useMemo(
        () => `/api/v2/completeness_stats.csv?${buildQueryString(params)}`,
        [params],
    );

    return (
        <>
            <TopBar
                title={formatMessage(MESSAGES.completenessStats)}
                displayBackButton={false}
            />
            <Box p={4} className={classes.container}>
                <Box>
                    <CompletenessStatsFilters params={params} />
                </Box>
                <Grid
                    container
                    item
                    style={{ paddingTop: '5px', paddingBottom: '5px' }}
                >
                    <Grid item container justifyContent="flex-end">
                        <CsvButton csvUrl={csvUrl} />
                    </Grid>
                </Grid>
                <Box>
                    <TableWithDeepLink
                        marginTop={false}
                        data={completenessStats?.results ?? []}
                        pages={completenessStats?.pages ?? 1}
                        defaultSorted={['name']}
                        columns={columns}
                        // @ts-ignore
                        count={completenessStats?.count ?? 0}
                        baseUrl={baseUrl}
                        params={params}
                        extraProps={{ loading: isFetching }}
                        onTableParamsChange={p => {
                            dispatch(redirectTo(baseUrl, p));
                        }}
                        rowProps={getRowStyles}
                    />
                </Box>
            </Box>
        </>
    );
};
