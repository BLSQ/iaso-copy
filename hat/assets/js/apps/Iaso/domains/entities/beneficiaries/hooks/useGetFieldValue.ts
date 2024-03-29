/* eslint-disable no-unused-vars */
import moment from 'moment';
// @ts-ignore
import { useSafeIntl } from 'bluesquare-components';

import { FileContent } from '../types/beneficiary';

import { FieldType } from '../../../forms/types/forms';

import MESSAGES from '../../messages';

const textPlaceholder = '--';

export const useGetFieldValue = (): ((
    fieldKey: string,
    fileContent: FileContent,
    type: FieldType,
) => string) => {
    const { formatMessage } = useSafeIntl();
    const getValue = (fieldKey, fileContent, type): string => {
        switch (type) {
            case 'text':
            case 'integer':
            case 'decimal':
            case 'select one':
            case 'note': {
                return fileContent[fieldKey] || textPlaceholder;
            }
            case 'date': {
                return fileContent[fieldKey]
                    ? moment(fileContent[fieldKey]).format('L')
                    : textPlaceholder;
            }
            case 'dateTime': {
                return fileContent[fieldKey]
                    ? moment(fileContent[fieldKey]).format('LTS')
                    : textPlaceholder;
            }
            case 'time': {
                return fileContent[fieldKey]
                    ? moment(fileContent[fieldKey]).format('T')
                    : textPlaceholder;
            }
            default:
                return formatMessage(MESSAGES.typeNotSupported, { type });
        }
    };
    return getValue;
};
