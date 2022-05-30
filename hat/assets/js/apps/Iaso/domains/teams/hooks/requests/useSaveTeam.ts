import { UseMutationResult } from 'react-query';
import { patchRequest, postRequest } from '../../../../libs/Api';
import { useSnackMutation } from '../../../../libs/apiHooks';

export type SaveTeamQuery = {
    id?: number;
    name: string;
    description?: string;
    manager: number;
    subTeams: Array<number>;
    project: number;
};

const convertToApi = data => {
    const { subTeams, manager, ...converted } = data;
    if (subTeams !== undefined) {
        converted.sub_teams = subTeams;
    }

    if (manager !== undefined) {
        converted.manager = parseInt(manager, 10);
    }

    return converted;
};

const endpoint = '/api/microplanning/teams/';

const patchTeam = async (body: Partial<SaveTeamQuery>) => {
    const url = `${endpoint}${body.id}/`;
    return patchRequest(url, convertToApi(body));
};

const postTeam = async (body: SaveTeamQuery) => {
    return postRequest(endpoint, convertToApi(body));
};

export const useSaveTeam = (type: 'create' | 'edit'): UseMutationResult => {
    const editTeam = useSnackMutation(
        (data: Partial<SaveTeamQuery>) => patchTeam(data),
        undefined,
        undefined,
        ['teamsList'],
    );
    const createTeam = useSnackMutation(
        (data: SaveTeamQuery) => postTeam(data),
        undefined,
        undefined,
        ['teamsList'],
    );

    switch (type) {
        case 'create':
            return createTeam;
        case 'edit':
            return editTeam;
        default:
            throw new Error(
                `wrong type expected: create, copy or edit, got:  ${type} `,
            );
    }
};
