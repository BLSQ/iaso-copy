import React, { FunctionComponent, useMemo } from 'react';
import TopBar from 'Iaso/components/nav/TopBarComponent';
import {
    useSafeIntl,
    // Table,
    AddButton as AddButtonComponent,
} from 'bluesquare-components';
import { Box, Grid } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { redirectTo } from 'Iaso/routing/actions';
import MESSAGES from '../../constants/messages';
import { GroupedCampaignsFilter } from './GroupedCampaignsFilter';
import { useStyles } from '../../styles/theme';
import { GROUPED_CAMPAIGNS } from '../../constants/routes';
import { useGetGroupedCampaigns } from '../../hooks/useGetGroupedCampaigns';
import { makeColumns } from './config';
import { GroupedCampaignDialog } from './GroupedCampaignDialog';
import { useDeleteGroupedCampaign } from '../../hooks/useDeleteGroupedCampaign';
import { TableWithDeepLink } from '../../../../../../hat/assets/js/apps/Iaso/components/tables/TableWithDeepLink';

type Params = {
    pageSize: string;
    order: string;
    page: string;
    search?: string;
};
type Props = {
    params: Params;
};

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;
const DEFAULT_ORDER = '-updated_at';

export const GroupedCampaigns: FunctionComponent<Props> = ({ params }) => {
    const { formatMessage } = useSafeIntl();
    const classes = useStyles();
    const tableParams = useMemo(() => {
        return {
            order: params.order ?? DEFAULT_ORDER,
            pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
            page: params.page ?? DEFAULT_PAGE,
            search: params.search,
        };
    }, [params]);
    const { data: groupedCampaigns, isFetching } =
        useGetGroupedCampaigns(tableParams);
    const dispatch = useDispatch();
    const { mutateAsync: deleteGroupedCampaign } = useDeleteGroupedCampaign();

    return (
        <>
            <TopBar
                title={formatMessage(MESSAGES.groupedCampaigns)}
                displayBackButton={false}
            />
            <Box className={classes.containerFullHeightNoTabPadded}>
                <GroupedCampaignsFilter />
                <Grid
                    container
                    spacing={0}
                    justifyContent="flex-end"
                    alignItems="center"
                    className={classes.marginTop}
                >
                    <GroupedCampaignDialog
                        renderTrigger={({ openDialog }) => (
                            <AddButtonComponent
                                dataTestId="add-grouped_campaign-button"
                                onClick={openDialog}
                            />
                        )}
                        type="create"
                    />
                </Grid>
                <TableWithDeepLink
                    data={groupedCampaigns?.results ?? []}
                    pages={groupedCampaigns?.pages ?? 1}
                    defaultSorted={[{ id: 'updated_at', desc: true }]}
                    columns={makeColumns(formatMessage, deleteGroupedCampaign)}
                    count={groupedCampaigns?.count ?? 0}
                    baseUrl={GROUPED_CAMPAIGNS}
                    params={tableParams}
                    onTableParamsChange={p =>
                        dispatch(redirectTo(GROUPED_CAMPAIGNS, p))
                    }
                    extraProps={{ loading: isFetching }}
                />
            </Box>
        </>
    );
};
