import React, { FunctionComponent } from 'react';
import {
    // @ts-ignore
    useSafeIntl,
    // @ts-ignore
    LoadingSpinner,
    // @ts-ignore
    commonStyles,
} from 'bluesquare-components';
import { Box, Grid, makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import InstanceFileContent from '../../instances/components/InstanceFileContent';
import {
    useGetVisitSubmission,
    useGetBeneficiary,
} from '../beneficiaries/hooks/requests';
import { BeneficiaryBaseInfo } from '../beneficiaries/components/BeneficiaryBaseInfo';
import TopBar from '../../../components/nav/TopBarComponent';
import MESSAGES from '../beneficiaries/messages';
import { redirectToReplace } from '../../../routing/actions';
import WidgetPaper from '../../../components/papers/WidgetPaperComponent';
import { baseUrls } from '../../../constants/urls';

type Props = {
    // instanceId: string;
    // beneficiaryId: string;
    params: { instanceId: string; beneficiaryId: string };
    router: Record<string, any>;
};

const useStyles = makeStyles(theme => {
    return {
        ...commonStyles(theme),
    };
});

export const VisitDetails: FunctionComponent<Props> = ({ params, router }) => {
    const { instanceId, beneficiaryId } = params;
    const classes = useStyles();
    const { formatMessage } = useSafeIntl();
    const { data: submission, isLoading: isLoadingSubmission } =
        useGetVisitSubmission(instanceId);
    const { data: beneficiary, isLoading: isLoadingbeneficiary } =
        useGetBeneficiary(beneficiaryId);
    // @ts-ignore
    const prevPathname = useSelector(state => state.routerCustom.prevPathname);
    const dispatch = useDispatch();
    // Null checking beforehand because moment will return a date by default
    const visitDate =
        submission?.created_at &&
        moment.unix(submission.created_at).format('LTS');
    const baseTitle = submission?.form_name ?? formatMessage(MESSAGES.details);
    const title = visitDate ? `${baseTitle} - ${visitDate}` : baseTitle;
    return (
        <>
            <TopBar
                title={formatMessage(MESSAGES.visitDetails)}
                displayBackButton
                goBack={() => {
                    if (prevPathname) {
                        router.goBack();
                    } else {
                        dispatch(
                            redirectToReplace(baseUrls.beneficiariesDetails, {
                                beneficiaryId,
                            }),
                        );
                    }
                }}
            />
            {/* @ts-ignore */}
            <Box className={classes.containerFullHeightNoTabPadded}>
                <Grid container item spacing={4}>
                    {!isLoadingbeneficiary && (
                        <Grid item xs={4}>
                            <WidgetPaper
                                title={formatMessage(MESSAGES.beneficiary)}
                            >
                                <BeneficiaryBaseInfo
                                    beneficiary={beneficiary}
                                />
                            </WidgetPaper>
                        </Grid>
                    )}
                    {isLoadingbeneficiary && <LoadingSpinner absolute />}

                    <Grid item xs={8}>
                        {!isLoadingSubmission && (
                            <WidgetPaper title={title}>
                                <InstanceFileContent instance={submission} />
                            </WidgetPaper>
                        )}
                        {isLoadingSubmission && <LoadingSpinner absolute />}
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};
