/* eslint-disable camelcase */
import React from 'react';
import {
    // @ts-ignore
    useSafeIntl,
    // @ts-ignore
    IconButton as IconButtonComponent,
} from 'bluesquare-components';
import MESSAGES from './messages';
import { DateTimeCell } from '../../components/Cells/DateTimeCell';
import { LinkToForm } from '../forms/components/LinkToForm';

import { IntlFormatMessage } from '../../types/intl';
import { Column } from '../../types/table';
import { baseUrls } from '../../constants/urls';

import { StatusCell } from './components/StatusCell';

export const defaultSorted = [{ id: 'version_id', desc: false }];

export const baseUrl = baseUrls.workflows;

export const useGetColumns = (entityTypeId: string): Array<Column> => {
    const { formatMessage }: { formatMessage: IntlFormatMessage } =
        useSafeIntl();
    const columns: Array<Column> = [
        {
            Header: formatMessage(MESSAGES.version),
            id: 'version_id',
            accessor: 'version_id',
        },
        {
            Header: formatMessage(MESSAGES.name),
            id: 'name',
            accessor: 'name',
        },
        {
            Header: formatMessage(MESSAGES.status),
            id: 'status',
            accessor: 'status',
            Cell: settings => {
                const { status } = settings.row.original;
                return <StatusCell status={status} />;
            },
        },
        {
            Header: formatMessage(MESSAGES.actions),
            resizable: false,
            sortable: false,
            accessor: 'actions',
            Cell: settings => {
                const { version_id: versionId } = settings.row.original;
                return (
                    <IconButtonComponent
                        url={`${baseUrls.workflowDetail}/entityTypeId/${entityTypeId}/versionId/${versionId}`}
                        icon="remove-red-eye"
                        tooltipMessage={MESSAGES.see}
                    />
                );
            },
        },
    ];
    return columns;
};
export const useGetChangesColumns = (
    entityTypeId: string,
    versionId: string,
): Array<Column> => {
    const { formatMessage }: { formatMessage: IntlFormatMessage } =
        useSafeIntl();
    const columns: Array<Column> = [
        {
            Header: formatMessage(MESSAGES.form),
            id: 'form_name',
            accessor: 'form_name',
            Cell: settings => {
                return (
                    <LinkToForm
                        formId={settings.row.original.form.id}
                        formName={settings.row.original.form.name}
                    />
                );
            },
        },
        {
            Header: formatMessage(MESSAGES.created_at),
            accessor: 'created_at',
            id: 'created_at',
            Cell: DateTimeCell,
        },
        {
            Header: formatMessage(MESSAGES.updated_at),
            accessor: 'updated_at',
            id: 'updated_at',
            Cell: DateTimeCell,
        },
        {
            Header: formatMessage(MESSAGES.actions),
            resizable: false,
            sortable: false,
            accessor: 'actions',
            Cell: settings => {
                return (
                    <IconButtonComponent
                        url={`${baseUrls.workflowDetail}/entityTypeId/${entityTypeId}/versionId/${versionId}/change/${settings.row.original.form_id}`}
                        icon="remove-red-eye"
                        tooltipMessage={MESSAGES.see}
                    />
                );
            },
        },
    ];
    return columns;
};
export const useGetFollowUpsColumns = (
    entityTypeId: string,
    versionId: string,
): Array<Column> => {
    const { formatMessage }: { formatMessage: IntlFormatMessage } =
        useSafeIntl();
    const columns: Array<Column> = [
        {
            Header: 'ID',
            id: 'id',
            sortable: false,
            accessor: 'id',
        },
        {
            Header: formatMessage(MESSAGES.forms),
            id: 'forms',
            sortable: false,
            Cell: settings => {
                const { forms } = settings.row.original;
                return forms.map((form, index) => (
                    <>
                        <LinkToForm formId={form.id} formName={form.name} />
                        {index + 1 < forms.length ? ', ' : ''}
                    </>
                ));
            },
        },
        {
            Header: formatMessage(MESSAGES.created_at),
            accessor: 'created_at',
            sortable: false,
            id: 'created_at',
            Cell: DateTimeCell,
        },
        {
            Header: formatMessage(MESSAGES.updated_at),
            accessor: 'updated_at',
            sortable: false,
            id: 'updated_at',
            Cell: DateTimeCell,
        },
        {
            Header: formatMessage(MESSAGES.actions),
            resizable: false,
            sortable: false,
            accessor: 'actions',
            Cell: settings => {
                return (
                    <IconButtonComponent
                        url={`${baseUrls.workflowDetail}/entityTypeId/${entityTypeId}/versionId/${versionId}/followUp/${settings.row.original.id}`}
                        icon="remove-red-eye"
                        tooltipMessage={MESSAGES.see}
                    />
                );
            },
        },
    ];
    return columns;
};
