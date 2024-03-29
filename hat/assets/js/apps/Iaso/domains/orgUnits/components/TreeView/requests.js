import { useSnackQuery } from '../../../../libs/apiHooks.ts';
import { getRequest } from '../../../../libs/Api';
import { dispatch } from '../../../../redux/store';
import { enqueueSnackbar } from '../../../../redux/snackBarsReducer';
import { errorSnackBar } from '../../../../constants/snackBars';

export const getChildrenData = id => {
    return getRequest(
        `/api/orgunits/?&parent_id=${id}&validation_status=all&treeSearch=true&ignoreEmptyNames=true`,
    )
        .then(response => {
            return response.orgunits.map(orgUnit => {
                return {
                    ...orgUnit,
                    id: orgUnit.id.toString(),
                };
            });
        })
        .catch(error => {
            dispatch(
                enqueueSnackbar(
                    errorSnackBar('getChildrenDataError', null, error),
                ),
            );
            console.error(
                'Error while fetching Treeview item children:',
                error,
            );
        });
};

const makeUrl = (id, type) => {
    if (id) {
        if (type === 'version')
            return `/api/orgunits/?&rootsForUser=true&version=${id}&validation_status=all&treeSearch=true&ignoreEmptyNames=true`;
        if (type === 'source')
            return `/api/orgunits/?&rootsForUser=true&source=${id}&validation_status=all&treeSearch=true&ignoreEmptyNames=true`;
    }
    return `/api/orgunits/?&rootsForUser=true&defaultVersion=true&validation_status=all&treeSearch=true&ignoreEmptyNames=true`;
};

// mapping the request result here i.o in the useRootData hook to keep the hook more generic
export const getRootData = (id, type = 'source') => {
    return getRequest(makeUrl(id, type))
        .then(response => {
            return response.orgunits.map(orgUnit => {
                return {
                    ...orgUnit,
                    id: orgUnit.id.toString(),
                };
            });
        })
        .catch(error => {
            dispatch(
                enqueueSnackbar(errorSnackBar('getRootDataError', null, error)),
            );
            console.error('Error while fetching Treeview items:', error);
        });
};

const endpoint = '/api/orgunits/';
const search = (input1, input2, type) => {
    switch (type) {
        case 'source':
            return `searches=[{"validation_status":"all","search":"${input1}","source":${input2}}]`;
        case 'version':
            return `searches=[{"validation_status":"all","search":"${input1}","version":${input2}}]`;
        default:
            return `searches=[{"validation_status":"all","search":"${input1}","defaultVersion":"true"}]`;
    }
};
const sortingAndPaging = resultsCount =>
    `order=name&page=1&limit=${resultsCount}&smallSearch=true`;

const makeSearchUrl = ({ value, count, source, version }) => {
    if (source) {
        return `${endpoint}?${search(
            value,
            source,
            'source',
        )}&${sortingAndPaging(count)}`;
    }
    if (version) {
        return `${endpoint}?${search(
            value,
            version,
            'version',
        )}&${sortingAndPaging(count)}`;
    }
    return `${endpoint}?${search(value)}&${sortingAndPaging(count)}`;
};

/**
 * @param {string} searchValue
 * @param {number} resultsCount
 */
export const searchOrgUnits = ({ value, count, source, version }) => {
    const url = makeSearchUrl({ value, count, source, version });
    return getRequest(url)
        .then(result => result.orgunits)
        .catch(error => {
            dispatch(
                enqueueSnackbar(
                    errorSnackBar('searchOrgUnitsError', null, error),
                ),
            );
            console.error('Error while searching org units:', error);
        });
};

export const useGetOrgUnit = OrgUnitId =>
    useSnackQuery(
        ['orgunits', OrgUnitId],
        async () => getRequest(`/api/orgunits/${OrgUnitId}/`),
        undefined,
        {
            enabled: OrgUnitId !== undefined && OrgUnitId !== null,
        },
    );
