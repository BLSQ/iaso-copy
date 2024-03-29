import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { redirectTo, redirectToReplace } from '../routing/actions';

export type FilterState = {
    filters: Record<string, unknown>;
    handleSearch: () => void;
    // eslint-disable-next-line no-unused-vars
    handleChange: (keyValue: string, value: unknown) => void;
    filtersUpdated: boolean;
    // eslint-disable-next-line no-unused-vars
    setFiltersUpdated: (updated: boolean) => void;
};

type FilterStateParams = {
    baseUrl: string;
    params: Record<string, unknown>;
    withPagination?: boolean;
    saveSearchInHistory?: boolean;
};

const paginationParams = ['pageSize', 'page', 'order'];

const removePaginationParams = params => {
    const newParams = {
        ...params,
    };
    paginationParams.forEach(paramKey => {
        delete newParams[paramKey];
    });
    return newParams;
};

export const useFilterState = ({
    baseUrl,
    params,
    withPagination = true,
    saveSearchInHistory = true,
}: FilterStateParams): FilterState => {
    const [filtersUpdated, setFiltersUpdated] = useState(false);
    const dispatch = useDispatch();
    const [filters, setFilters] = useState({
        ...removePaginationParams(params),
    });

    const handleSearch = useCallback(() => {
        if (filtersUpdated) {
            setFiltersUpdated(false);
            const tempParams = {
                ...params,
                ...filters,
            };
            if (withPagination) {
                tempParams.page = '1';
            }
            if (saveSearchInHistory) {
                dispatch(redirectTo(baseUrl, tempParams));
            } else {
                dispatch(redirectToReplace(baseUrl, tempParams));
            }
        }
    }, [
        filtersUpdated,
        params,
        filters,
        withPagination,
        saveSearchInHistory,
        dispatch,
        baseUrl,
    ]);

    const handleChange = useCallback(
        (key, value) => {
            setFiltersUpdated(true);
            setFilters({
                ...filters,
                [key]: value,
            });
        },
        [filters],
    );

    useEffect(() => {
        setFilters(removePaginationParams(params));
    }, [params]);

    return useMemo(() => {
        return {
            filters,
            handleChange,
            handleSearch,
            filtersUpdated,
            setFiltersUpdated,
        };
    }, [filters, handleChange, handleSearch, filtersUpdated]);
};
