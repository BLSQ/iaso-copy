import {
    fetchOrgUnitsTypes,
    fetchDevices,
    fetchDevicesOwnerships,
} from '../../utils/requests';
import { setOrgUnitTypes } from '../orgUnits/actions';
import { getRequest } from '../../libs/Api';
import { useSnackQuery } from '../../libs/apiHooks';
import {
    setDevicesList,
    setDevicesOwnershipList,
} from '../../redux/devicesReducer';

import { useFetchOnMount } from '../../hooks/fetchOnMount';

export const useInstancesFiltersData = (
    formId,
    setFetchingOrgUnitTypes,
    setFetchingDevices,
    setFetchingDevicesOwnerships,
) => {
    const promisesArray = [
        {
            fetch: fetchOrgUnitsTypes,
            setFetching: setFetchingOrgUnitTypes,
            setData: setOrgUnitTypes,
        },
        {
            fetch: fetchDevices,
            setFetching: setFetchingDevices,
            setData: setDevicesList,
        },
        {
            fetch: fetchDevicesOwnerships,
            setFetching: setFetchingDevicesOwnerships,
            setData: setDevicesOwnershipList,
        },
    ];

    useFetchOnMount(promisesArray);
};

export const useGetForms = () => {
    const params = {
        all: true,
        order: 'name',
        fields: 'name,period_type,label_keys,id',
    };
    const queryString = new URLSearchParams(params);

    return useSnackQuery(['forms', params], () =>
        getRequest(`/api/forms/?${queryString.toString()}`),
    );
};

export const useGetPeriods = formId => {
    const params = {
        form_id: formId,
    };
    const queryString = new URLSearchParams(params);

    return useSnackQuery(['periods', params], () => {
        return getRequest(`/api/periods/?${queryString.toString()}`);
    });
};
