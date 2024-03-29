import React, { useCallback, ReactNode } from 'react';
// @ts-ignore
import { AddButton, IconButton, useSafeIntl } from 'bluesquare-components';
import { makeStyles } from '@material-ui/core';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import MESSAGES from '../../../constants/messages';
import { IntlMessage } from '../../../../../../../hat/assets/js/apps/Iaso/types/intl';
import { DropdownOptions } from '../../../../../../../hat/assets/js/apps/Iaso/types/utils';
import { BudgetEventType } from '../../../constants/types';

const style = theme => {
    return {
        addButton: {
            [theme.breakpoints.down('md')]: {
                marginLeft: theme.spacing(1),
            },
        },
    };
};

const useButtonStyles = makeStyles(style);

export const useRenderTrigger = (
    type: 'create' | 'edit' | 'retry' = 'create',
    isMobileLayout: boolean,
    color = 'action',
): ReactNode => {
    const classes = useButtonStyles();
    return useCallback(
        ({ openDialog }) => {
            if (type === 'edit' || type === 'retry') {
                return (
                    <IconButton
                        color={color}
                        onClick={openDialog}
                        overrideIcon={AutorenewIcon}
                        tooltipMessage={MESSAGES.resendFiles}
                    />
                );
            }
            return (
                // The div prevents the Button from being too big on small screens
                <div className={classes.addButton}>
                    <AddButton
                        onClick={openDialog}
                        dataTestId="create-budgetStep-button"
                        size={isMobileLayout ? 'small' : 'medium'}
                        message={
                            isMobileLayout ? MESSAGES.add : MESSAGES.addStep
                        }
                    />
                </div>
            );
        },
        [classes.addButton, color, type, isMobileLayout],
    );
};

export const getTitleMessage = (
    type: 'create' | 'edit' | 'retry',
): IntlMessage => {
    if (type === 'create') return MESSAGES.newBudgetStep;
    if (type === 'edit') return MESSAGES.resendFiles;
    if (type === 'retry') return MESSAGES.tryUpdateStep;
    throw new Error(
        `expected type to be one of: create, edit,retry, got ${type}`,
    );
};

export const makeEventsDropdown = (
    user,
    approvalTeams,
    formatMessage,
): DropdownOptions<BudgetEventType>[] => {
    const isUserApprover = Boolean(
        approvalTeams
            ?.map(validationTeam => validationTeam.users)
            .flat()
            .find(userId => userId === user.user_id),
    );
    const baseOptions: DropdownOptions<BudgetEventType>[] = [
        {
            label: formatMessage(MESSAGES.submission) as string,
            value: 'submission',
        },
        {
            label: formatMessage(MESSAGES.comments) as string,
            value: 'comments',
        },
        {
            label: formatMessage(MESSAGES.request) as string,
            value: 'request',
        },
        {
            label: formatMessage(MESSAGES.feedback) as string,
            value: 'feedback',
        },
        {
            label: formatMessage(MESSAGES.transmission) as string,
            value: 'transmission',
        },
        {
            label: formatMessage(MESSAGES.review) as string,
            value: 'review',
        },
    ];
    if (isUserApprover) {
        return [
            ...baseOptions,
            {
                value: 'validation',
                label: formatMessage(MESSAGES.validation),
            },
        ];
    }
    return baseOptions;
};

export const useAllEventsOption = (): DropdownOptions<BudgetEventType>[] => {
    const { formatMessage } = useSafeIntl();
    return [
        {
            label: formatMessage(MESSAGES.submission) as string,
            value: 'submission',
        },
        {
            label: formatMessage(MESSAGES.comments) as string,
            value: 'comments',
        },
        {
            label: formatMessage(MESSAGES.request) as string,
            value: 'request',
        },
        {
            label: formatMessage(MESSAGES.feedback) as string,
            value: 'feedback',
        },
        {
            label: formatMessage(MESSAGES.transmission) as string,
            value: 'transmission',
        },
        {
            label: formatMessage(MESSAGES.review) as string,
            value: 'review',
        },
        {
            value: 'validation',
            label: formatMessage(MESSAGES.validation),
        },
    ];
};
