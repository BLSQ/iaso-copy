import React from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { Tooltip } from '@material-ui/core';

import { IconButton as IconButtonComponent } from 'bluesquare-components';
// eslint-disable-next-line import/no-named-as-default-member,import/no-named-as-default
import PublishIcon from '@material-ui/icons/Publish';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import DataSourceDialogComponent from './components/DataSourceDialogComponent';
import MESSAGES from './messages';
import { VersionsDialog } from './components/VersionsDialog';
import { YesNoCell } from '../../components/Cells/YesNoCell';
import { ExportToDHIS2Dialog } from './components/ExportToDHIS2Dialog';

const dataSourcesTableColumns = (
    formatMessage,
    setForceRefresh,
    defaultSourceVersion,
) => [
    {
        Header: formatMessage(MESSAGES.defaultSource),
        accessor: 'defaultSource',
        sortable: false,
        Cell: settings =>
            defaultSourceVersion?.source?.id === settings.row.original.id && (
                <Tooltip title={formatMessage(MESSAGES.defaultSource)}>
                    <CheckCircleIcon color="primary" />
                </Tooltip>
            ),
    },
    {
        Header: formatMessage(MESSAGES.defaultVersion),
        id: 'default_version__number',
        accessor: row => row.default_version?.number,
    },
    {
        Header: formatMessage(MESSAGES.dataSourceName),
        accessor: 'name',
    },
    {
        Header: formatMessage(MESSAGES.dataSourceDescription),
        accessor: 'description',
    },
    {
        Header: formatMessage(MESSAGES.dataSourceReadOnly),
        accessor: 'read_only',
        Cell: YesNoCell,
    },
    {
        Header: formatMessage(MESSAGES.actions),
        accessor: 'actions',
        resizable: false,
        sortable: false,
        Cell: settings => {
            return (
                <section>
                    <DataSourceDialogComponent
                        renderTrigger={({ openDialog }) => (
                            <IconButtonComponent
                                dataTestId={`datasource-dialog-button-${settings.row.original.id}`}
                                onClick={openDialog}
                                icon="edit"
                                tooltipMessage={MESSAGES.edit}
                            />
                        )}
                        initialData={{
                            ...settings.row.original,
                            projects: settings.row.original.projects.flat(),
                        }}
                        defaultSourceVersion={defaultSourceVersion}
                        key={settings.row.original.updated_at}
                        onSuccess={() => setForceRefresh(true)}
                        sourceCredentials={
                            settings.row.original.credentials
                                ? settings.row.original.credentials
                                : {}
                        }
                    />
                    <VersionsDialog
                        renderTrigger={({ openDialog }) => (
                            <IconButtonComponent
                                dataTestId={`open-versions-dialog-button-${settings.row.original.id}`}
                                onClick={openDialog}
                                overrideIcon={FormatListNumberedIcon}
                                tooltipMessage={MESSAGES.versions}
                            />
                        )}
                        defaultSourceVersion={defaultSourceVersion}
                        source={settings.row.original}
                        forceRefreshParent={() => setForceRefresh(true)}
                    />
                    <ExportToDHIS2Dialog
                        renderTrigger={({ openDialog }) => (
                            <IconButtonComponent
                                dataTestId={`export-dhis2-dialog-button-${settings.row.original.id}`}
                                onClick={openDialog}
                                overrideIcon={PublishIcon}
                                tooltipMessage={MESSAGES.compareAndExport}
                            />
                        )}
                        dataSourceName={settings.row.original.name}
                        dataSourceId={settings.row.original.id}
                        versions={settings.row.original.versions}
                        defaultVersionId={
                            settings.row.original?.default_version?.id
                        }
                    />
                </section>
            );
        },
    },
];
export default dataSourcesTableColumns;
