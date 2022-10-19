import { Box, Grid, Typography } from '@material-ui/core';
import { useFormikContext } from 'formik';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
// @ts-ignore
import { useSafeIntl, IconButton } from 'bluesquare-components';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import MESSAGES from '../../../constants/messages';
import { NamedLink } from './NamedLink';
import { StepForm } from '../types';

type Props = { required?: boolean };

export const AddMultipleLinks: FunctionComponent<Props> = ({
    required = false,
}) => {
    const { formatMessage } = useSafeIntl();
    const { setFieldValue, values } = useFormikContext<StepForm>();

    const links = useMemo(() => values?.links ?? [], [values?.links]);

    const handleAddlink = () => {
        const newLinks = [...links, {}];
        if (links.length === 0) {
            newLinks.push({});
        }
        setFieldValue(`links`, newLinks);
    };

    const handleRemoveLastLink = useCallback(() => {
        if (links.length > 1) {
            const newLinks = [...links];
            newLinks.pop();
            setFieldValue(`links`, newLinks);
        }
    }, [setFieldValue, links]);

    return (
        <>
            <div>
                <Typography style={{ display: 'inline' }}>
                    {formatMessage(MESSAGES.links)}
                    {required && <sup>*</sup>}
                </Typography>
            </div>
            <Box mt={2}>
                {links.length > 1 &&
                    links.map((_link, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <NamedLink index={index} key={`lonk-${index}`} />
                    ))}
                {/* if the condition is on length === 0 the UI will flicker and the field lose focus because of re-render */}
                {links.length <= 1 && <NamedLink index={0} />}

                <Grid
                    container
                    spacing={2}
                    direction="column"
                    justifyContent="flex-end"
                >
                    <Box mb={2}>
                        <Grid
                            container
                            item
                            direction="row"
                            justifyContent="flex-end"
                            spacing={2}
                            xs={12}
                        >
                            <Grid item>
                                <IconButton
                                    onClick={handleAddlink}
                                    variant="outlined"
                                    overrideIcon={AddIcon}
                                    tooltipMessage={MESSAGES.addLink}
                                >
                                    {formatMessage(MESSAGES.addLink)}
                                </IconButton>
                            </Grid>
                            <Grid item>
                                <IconButton
                                    onClick={handleRemoveLastLink}
                                    disabled={!(links.length > 1)}
                                    variant="outlined"
                                    overrideIcon={RemoveIcon}
                                    tooltipMessage={MESSAGES.removeLastLink}
                                >
                                    {formatMessage(MESSAGES.removeLastLink)}
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Box>
        </>
    );
};