import React, { FunctionComponent } from 'react';
// @ts-ignore
import { makeStyles, Box } from '@material-ui/core';
// @ts-ignore
import { commonStyles, useSafeIntl } from 'bluesquare-components';
import { useDispatch } from 'react-redux';

import { useGoBack } from '../../routing/useGoBack';

import TopBar from '../../components/nav/TopBarComponent';
import { TableWithDeepLink } from '../../components/tables/TableWithDeepLink';
import { Filters } from './components/Filters';

import { useGetWorkflowVersions } from './hooks/requests/useGetWorkflowVersions';
import { useGetType } from '../entities/entityTypes/hooks/requests/entitiyTypes';
import { WorkflowsParams } from './types/workflows';

import { redirectToReplace } from '../../routing/actions';

import MESSAGES from './messages';
import { useGetColumns, defaultSorted, baseUrl } from './config';

const useStyles = makeStyles(theme => ({
    ...commonStyles(theme),
}));

type Router = {
    goBack: () => void;
};
type Props = {
    params: WorkflowsParams;
    router: Router;
};

export const Workflows: FunctionComponent<Props> = ({ params, router }) => {
    const dispatch = useDispatch();
    const goBack = useGoBack(router);
    const classes: Record<string, string> = useStyles();
    const { formatMessage } = useSafeIntl();
    const { data, isFetching } = useGetWorkflowVersions(params);
    const { entityTypeId } = params;
    const columns = useGetColumns(entityTypeId);

    const { data: entityType } = useGetType(entityTypeId);
    const title = entityType
        ? `${entityType.name} - ${formatMessage(MESSAGES.workflows)}`
        : '';
    return (
        <>
            <TopBar title={title} displayBackButton goBack={() => goBack()} />
            <Box className={classes.containerFullHeightNoTabPadded}>
                <Filters params={params} />
                <TableWithDeepLink
                    baseUrl={baseUrl}
                    data={data?.workflow_versions ?? []}
                    pages={data?.pages ?? 1}
                    defaultSorted={defaultSorted}
                    columns={columns}
                    count={data?.count ?? 0}
                    params={params}
                    onTableParamsChange={p =>
                        dispatch(redirectToReplace(baseUrl, p))
                    }
                    extraProps={{ loading: isFetching }}
                />
            </Box>
        </>
    );
};