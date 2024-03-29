import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@material-ui/core';
import { get } from 'lodash';

export const TextInput = ({ field = {}, form = {}, value, ...props } = {}) => {
    const hasError =
        form.errors &&
        Boolean(get(form.errors, field.name) && get(form.touched, field.name));
    return (
        <TextField
            InputLabelProps={{
                shrink: true,
            }}
            fullWidth
            variant="outlined"
            size="medium"
            {...props}
            {...field}
            onFocus={() => form.setFieldTouched(field.name, true)}
            value={field.value ?? value ?? ''}
            error={hasError}
            helperText={hasError ? get(form.errors, field.name) : undefined}
        />
    );
};

TextInput.defaultProps = {
    field: {},
    form: {},
    value: undefined,
};

TextInput.propTypes = {
    field: PropTypes.object,
    form: PropTypes.object,
    value: PropTypes.any,
};
