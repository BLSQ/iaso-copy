/* eslint-disable react/require-default-props */
import React, {
    FunctionComponent,
    useCallback,
    useState,
    useMemo,
} from 'react';
import { Box, Divider, Grid } from '@material-ui/core';
// @ts-ignore
import ConfirmCancelDialogComponent from 'Iaso/components/dialogs/ConfirmCancelDialogComponent';
import { useSafeIntl } from 'bluesquare-components';
import MESSAGES from '../../constants/messages';
import InputComponent from '../../../../../../hat/assets/js/apps/Iaso/components/forms/InputComponent';
import { useGetCampaigns } from '../../hooks/useGetCampaigns';
import { makeCampaignsDropDownWithUUID } from '../../utils';
import {
    GroupedCampaignQuery,
    useSaveGroupedCampaign,
} from '../../hooks/useSaveGroupedCampaign';
import { commaSeparatedIdsToStringArray } from '../../../../../../hat/assets/js/apps/Iaso/utils/forms';

type Props = {
    // titleMessage: IntlMessage;
    name?: string;
    campaigns?: string[];
    type: 'create' | 'edit';
    id?: string;
    // eslint-disable-next-line no-unused-vars
    renderTrigger: (openDialog: { openDialog: () => void }) => Element;
};

const GROUPED_CAMPAIGN_NAME = 'groupedCampaignName';
const CHILDREN_CAMPAIGNS = 'childrenCampaigns';

const emptyCampaigns = [];

export const GroupedCampaignDialog: FunctionComponent<Props> = ({
    // titleMessage,
    name = '',
    campaigns = emptyCampaigns,
    type,
    id,
    renderTrigger,
}) => {
    const { formatMessage } = useSafeIntl();
    const [groupedCampaignName, setGroupedCampaignName] =
        useState<string>(name);
    const [campaignsToLink, setCampaignsToLink] = useState<string[]>(campaigns);
    // TODO refactor this hook to make more flexible
    const { data: allCampaigns } = useGetCampaigns().query;
    const allCampaignsDropdown = useMemo(
        () => makeCampaignsDropDownWithUUID(allCampaigns),
        [allCampaigns],
    );
    const { mutateAsync: saveGroupedCampaign } = useSaveGroupedCampaign(type);
    const reset = useCallback(() => {
        setGroupedCampaignName(name);
        setCampaignsToLink(campaigns);
    }, [campaigns, name]);

    const onConfirm = useCallback(
        async closeDialog => {
            const query: GroupedCampaignQuery = id
                ? {
                      id,
                      name: groupedCampaignName,
                      campaigns_ids:
                          // FIXME dirty workaround because campaignToLink is sometimes string sometime array
                          typeof campaignsToLink === 'string'
                              ? commaSeparatedIdsToStringArray(campaignsToLink)
                              : campaignsToLink,
                  }
                : {
                      name: groupedCampaignName,
                      campaigns_ids:
                          typeof campaignsToLink === 'string'
                              ? commaSeparatedIdsToStringArray(campaignsToLink)
                              : campaignsToLink,
                  };
            // call in this order to avoid mem leak error
            closeDialog();
            reset();
            await saveGroupedCampaign(query);
        },
        [campaignsToLink, groupedCampaignName, id, saveGroupedCampaign, reset],
    );
    const onCancel = useCallback(
        closeDialog => {
            reset();
            closeDialog();
        },
        [reset],
    );
    const allowConfirm = Boolean(groupedCampaignName);
    return (
        <ConfirmCancelDialogComponent
            id="grouped-campaigns-modal"
            renderTrigger={renderTrigger}
            onConfirm={onConfirm}
            confirmMessage={MESSAGES.save}
            cancelMessage={MESSAGES.close}
            maxWidth="md"
            titleMessage={MESSAGES.editGroupedCampaign}
            onCancel={onCancel}
            dataTestId="grouped-campaigns-modal"
            allowConfirm={allowConfirm}
            additionalButton={undefined}
            additionalMessage={undefined}
            allowConfimAdditionalButton={undefined}
            onAdditionalButtonClick={undefined}
        >
            <>
                <Box mb={2}>
                    <Divider />
                </Box>
                <Grid
                    container
                    spacing={2}
                    direction="row"
                    justifyContent="space-around"
                >
                    <Grid container item xs={6}>
                        <Grid item xs={12}>
                            <InputComponent
                                keyValue={GROUPED_CAMPAIGN_NAME}
                                type="text"
                                labelString={formatMessage(MESSAGES.name)}
                                onChange={(_keyValue, value) => {
                                    setGroupedCampaignName(value);
                                }}
                                value={groupedCampaignName}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <InputComponent
                                keyValue={CHILDREN_CAMPAIGNS}
                                type="select"
                                options={allCampaignsDropdown}
                                labelString={formatMessage(
                                    MESSAGES.campaignsToLink,
                                )}
                                onChange={(_keyValue, value) => {
                                    setCampaignsToLink(value);
                                }}
                                value={campaignsToLink}
                                required
                                multi
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </>
        </ConfirmCancelDialogComponent>
    );
};
