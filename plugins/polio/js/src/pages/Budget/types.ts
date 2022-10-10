/* eslint-disable camelcase */
import { Nullable } from '../../../../../../hat/assets/js/apps/Iaso/types/utils';

export type Budget = {
    id: number;
    obr_name: string;
    campaign_id: string;
    country_name: string;
    current_state: {
        key: string;
        label: string;
    };
    // -> optional: need to pass a param for the API to return it
    next_transitions?: {
        key: string;
        label: string;
        allowed: boolean; // depends on the user's team
        reason_not_allowed: Nullable<string>;
        required_fields: string[]; // comment, file, links
        help_text: string;
        displayed_fields: string[]; // This field determines the columns shown in the "create" modal
    }[];
};

export type LinkWithAlias = { alias: string; url: string };
export type FileWithName = { file: string; filename: string };

export type BudgetStep = {
    id: number;
    created_at: string; // Date in string form
    created_by: { username: string; first_name: string; last_name: string }; /// created_by
    created_by_team: string;
    comment?: string;
    links?: LinkWithAlias[];
    files?: FileWithName[];
    amount?: number;
    transition_key: string; // (step name)
    transition_label: string; // (step name)
    // eslint-disable-next-line no-undef
    deleted_at: Nullable<string>;
};
