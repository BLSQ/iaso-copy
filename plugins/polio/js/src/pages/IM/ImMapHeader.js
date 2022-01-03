import React from 'react';
import { oneOf } from 'prop-types';
import { Typography, Box } from '@material-ui/core';
import { useSafeIntl } from 'bluesquare-components';
import MESSAGES from '../../constants/messages';

export const ImMapHeader = ({ round }) => {
    const { formatMessage } = useSafeIntl();

    return (
        <Box>
            <Typography variant="h5">
                {`${formatMessage(MESSAGES[round])}`}
            </Typography>
        </Box>
    );
};

ImMapHeader.propTypes = {
    round: oneOf(['round_1', 'round_2']).isRequired,
};