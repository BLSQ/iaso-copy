import React, { FunctionComponent } from 'react';

import { Change, ReferenceForm, WorkflowVersionDetail } from '../../types';

import MESSAGES from '../../messages';
import DeleteDialog from '../../../../components/dialogs/DeleteDialogComponent';
import { ChangesModal } from './Modal';

import { useDeleteWorkflowChange } from '../../hooks/requests/useDeleteWorkflowChange';
import { PossibleField } from '../../../forms/types/forms';

type Props = {
    change: Change;
    versionId: string;
    possibleFields: PossibleField[];
    referenceForm?: ReferenceForm;
    workflowVersion?: WorkflowVersionDetail;
};

export const ChangesActionCell: FunctionComponent<Props> = ({
    change,
    versionId,
    possibleFields,
    referenceForm,
    workflowVersion,
}) => {
    const { mutate: deleteWorkflowChange } = useDeleteWorkflowChange();
    return (
        <>
            <ChangesModal
                change={change}
                versionId={versionId}
                possibleFields={possibleFields}
                referenceForm={referenceForm}
                changes={workflowVersion?.changes || []}
            />
            <DeleteDialog
                keyName={`delete-workflow-change-${change.id}`}
                titleMessage={MESSAGES.deleteChange}
                message={MESSAGES.deleteText}
                onConfirm={() => deleteWorkflowChange(change.id)}
            />
        </>
    );
};
