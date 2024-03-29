import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    useMemo,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useSafeIntl, useSkipEffectOnMount } from 'bluesquare-components';
import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import { isUndefined } from 'lodash';
import { useGetFormsByProjects } from '../../../instances/hooks';
import ConfirmCancelDialogComponent from '../../../../components/dialogs/ConfirmCancelDialogComponent';
import InputComponent from '../../../../components/forms/InputComponent';
import MESSAGES from '../messages';
import { userHasPermission } from '../../../users/utils';
import {
    saveOrgUnitType as saveOrgUnitTypeAction,
    createOrgUnitType as createOrgUnitTypeAction,
} from '../actions';
import { useFormState } from '../../../../hooks/form';
import {
    commaSeparatedIdsToArray,
    isFieldValid,
    isFormValid,
} from '../../../../utils/forms';
import { requiredFields } from '../config/requiredFields';

const mapOrgUnitType = orgUnitType => {
    return {
        id: orgUnitType.id,
        name: orgUnitType.name,
        short_name: orgUnitType.short_name,
        project_ids: orgUnitType.projects.map(project => project.id),
        depth: orgUnitType.depth,
        sub_unit_type_ids: orgUnitType.sub_unit_types.map(unit => unit.id),
        reference_form_id: orgUnitType?.reference_form?.id,
    };
};

const OrgUnitsTypesDialog = ({
    orgUnitType,
    titleMessage,
    onConfirmed,
    ...dialogProps
}) => {
    const [formState, setFieldValue, setFieldErrors, setFormState] =
        useFormState(mapOrgUnitType(orgUnitType));

    const [allForms, setAllForms] = useState();
    const { data } = useGetFormsByProjects();
    const dataForms = data && data.forms;

    const formStateUpdated = useRef(null);
    const projectsEmptyUpdated = useRef(null);
    const dispatch = useDispatch();
    const { formatMessage } = useSafeIntl();

    const [referenceFormMessage, setReferenceFormMessage] = useState(
        isEmpty(formState.project_ids.value)
            ? MESSAGES.selectProjects
            : MESSAGES.referenceForm,
    );

    const [projectsEmpty, setProjectsEmpty] = useState(
        !!isEmpty(formState.project_ids.value),
    );

    const { allOrgUnitTypes, allProjects } = useSelector(state => ({
        allOrgUnitTypes: state.orgUnitsTypes.allTypes || [],
        allProjects: state.projects.allProjects || [],
    }));

    const getFilteredForms = (projects, forms) => {
        return forms?.filter(form => {
            const formProjects = form.projects.map(project => project.id);
            const sameProjectsIds = intersection(projects, formProjects);
            if (!isEmpty(sameProjectsIds)) {
                return formProjects;
            }
            return null;
        });
    };

    const getFormPerProjects = useCallback(
        projects => {
            let forms = [];
            if (projects) {
                forms = getFilteredForms(projects, dataForms);
            }
            setFieldValue('reference_form_id', null);
            return forms;
        },
        [dataForms, setFieldValue],
    );

    const updateFormState = () => {
        if (formStateUpdated.current !== formState) {
            setAllForms(
                getFilteredForms(formState.project_ids.value, dataForms),
            );

            formStateUpdated.current = formState;
        }
    };

    const updateProjectsWhenEmpty = () => {
        if (projectsEmptyUpdated.current !== formState.project_ids.value) {
            if (isEmpty(formState.project_ids.value)) {
                setProjectsEmpty(true);
                setReferenceFormMessage(MESSAGES.selectProjects);
            } else {
                setProjectsEmpty(false);
                setReferenceFormMessage(MESSAGES.referenceForm);
            }
        }
    };

    useSkipEffectOnMount(() => {
        updateFormState();
        updateProjectsWhenEmpty();
    }, [allForms, formState, formState.project_ids.value]);

    useEffect(() => {
        if (isUndefined(allForms) && !isEmpty(formState.project_ids.value)) {
            setAllForms(
                getFilteredForms(formState.project_ids.value, dataForms),
            );
        }
    }, [dataForms, formState.project_ids.value, allForms]);

    const currentUser = useSelector(state => state.users.current);

    const onChange = useCallback(
        (keyValue, value) => {
            if (
                keyValue === 'sub_unit_type_ids' ||
                keyValue === 'project_ids'
            ) {
                setFieldValue(keyValue, commaSeparatedIdsToArray(value));
                if (keyValue === 'project_ids') {
                    const projectIds = value
                        ?.split(',')
                        .map(val => parseInt(val, 10));
                    setAllForms(getFormPerProjects(projectIds));
                }
            } else {
                setFieldValue(keyValue, value);
            }

            if (!isFieldValid(keyValue, value, requiredFields)) {
                setFieldErrors(keyValue, [
                    formatMessage(MESSAGES.requiredField),
                ]);
            }
        },
        [setFieldValue, setFieldErrors, formatMessage, getFormPerProjects],
    );

    const onConfirm = useCallback(
        closeDialog => {
            const savePromise =
                orgUnitType.id === null
                    ? dispatch(createOrgUnitTypeAction(formState))
                    : dispatch(saveOrgUnitTypeAction(formState));

            savePromise
                .then(() => {
                    closeDialog();
                    onConfirmed();
                })
                .catch(error => {
                    if (error.status === 400) {
                        Object.entries(error.details).forEach(entry =>
                            setFieldErrors(entry[0], entry[1]),
                        );
                    }
                });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dispatch, setFieldErrors, formState],
    );
    const hasPermission =
        userHasPermission('iaso_org_units', currentUser) &&
        userHasPermission('iaso_forms', currentUser);

    const resetForm = () => {
        setFormState(mapOrgUnitType(orgUnitType));
    };

    const subUnitTypes = allOrgUnitTypes.filter(
        subUnit => subUnit.id !== formState.id.value,
    );

    const allProjectWithInvalids = useMemo(() => {
        const allUserProjectsIds = allProjects?.map(p => p.id);
        const orgUnitypeProjects = orgUnitType.projects
            .filter(p => !allUserProjectsIds.includes(p.id))
            ?.map(project => ({
                label: project.name,
                value: project.id,
                color: '#eb4034',
            }));

        return (
            allProjects
                ?.map(p => ({
                    label: p.name,
                    value: p.id,
                }))
                .concat(orgUnitypeProjects) ?? []
        );
    }, [allProjects, orgUnitType.projects]);

    return (
        <ConfirmCancelDialogComponent
            id="OuTypes-modal"
            titleMessage={titleMessage}
            onConfirm={onConfirm}
            onCancel={closeDialog => {
                closeDialog();
                resetForm();
            }}
            cancelMessage={MESSAGES.cancel}
            confirmMessage={MESSAGES.save}
            // eslint-disable-next-line react/jsx-props-no-spreading
            allowConfirm={isFormValid(requiredFields, formState)}
            maxWidth="xs"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...dialogProps}
        >
            <InputComponent
                keyValue="name"
                onChange={onChange}
                value={formState.name.value}
                errors={formState.name.errors}
                type="text"
                label={MESSAGES.name}
                required
            />

            <InputComponent
                keyValue="short_name"
                onChange={onChange}
                value={formState.short_name.value}
                errors={formState.short_name.errors}
                type="text"
                label={MESSAGES.shortName}
                required
            />

            <InputComponent
                multi
                clearable
                keyValue="project_ids"
                onChange={onChange}
                value={formState.project_ids.value}
                errors={formState.project_ids.errors}
                type="select"
                options={allProjectWithInvalids}
                label={MESSAGES.projects}
                required
            />

            <InputComponent
                keyValue="depth"
                onChange={onChange}
                value={formState.depth.value}
                errors={formState.depth.errors}
                type="number"
                label={MESSAGES.depth}
                required
            />

            <InputComponent
                multi
                clearable
                keyValue="sub_unit_type_ids"
                onChange={onChange}
                value={formState.sub_unit_type_ids.value}
                errors={formState.sub_unit_type_ids.errors}
                type="select"
                options={subUnitTypes.map(orgunitType => ({
                    value: orgunitType.id,
                    label: orgunitType.name,
                }))}
                label={MESSAGES.subUnitTypes}
            />
            {hasPermission && (
                <InputComponent
                    clearable
                    keyValue="reference_form_id"
                    onChange={onChange}
                    value={formState.reference_form_id?.value}
                    errors={formState.reference_form_id.errors}
                    type="select"
                    disabled={projectsEmpty}
                    options={
                        allForms &&
                        allForms.map(form => ({
                            value: form.id,
                            label: form.name,
                        }))
                    }
                    label={referenceFormMessage}
                />
            )}
        </ConfirmCancelDialogComponent>
    );
};
OrgUnitsTypesDialog.propTypes = {
    orgUnitType: PropTypes.object,
    titleMessage: PropTypes.object.isRequired,
    renderTrigger: PropTypes.func.isRequired,
    onConfirmed: PropTypes.func.isRequired,
};
OrgUnitsTypesDialog.defaultProps = {
    orgUnitType: {
        id: null,
        name: '',
        short_name: '',
        projects: [],
        depth: 0,
        sub_unit_types: [],
        reference_form: null,
    },
};

export default OrgUnitsTypesDialog;
