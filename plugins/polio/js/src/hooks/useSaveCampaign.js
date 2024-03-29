import { useSnackMutation } from 'Iaso/libs/apiHooks.ts';
import { postRequest, putRequest } from 'Iaso/libs/Api';
import { commaSeparatedIdsToStringArray } from '../../../../../hat/assets/js/apps/Iaso/utils/forms';

// we need this check because the select box returns the list in string format, but the api retirns an actual array
const formatGroupedCampaigns = groupedCampaigns => {
    if (typeof groupedCampaigns === 'string')
        return commaSeparatedIdsToStringArray(groupedCampaigns);
    return groupedCampaigns ?? [];
};
export const useSaveCampaign = () => {
    return useSnackMutation(
        body => {
            // TODO remove this hack when we get the real multiselect in polio
            const hackedBody = {
                ...body,
                grouped_campaigns: formatGroupedCampaigns(
                    body.grouped_campaigns,
                ),
            };
            return hackedBody.id
                ? putRequest(
                      `/api/polio/campaigns/${hackedBody.id}/`,
                      hackedBody,
                  )
                : postRequest('/api/polio/campaigns/', hackedBody);
        },
        undefined,
        undefined,
        ['polio', 'campaigns'],
    );
};
