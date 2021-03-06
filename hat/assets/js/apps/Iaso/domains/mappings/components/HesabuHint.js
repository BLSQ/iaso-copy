import React from 'react';
import PropTypes from 'prop-types';
import { useSafeIntl } from 'bluesquare-components';
import ObjectDumper from './ObjectDumper';
// https://dhis2.fbrcameroun.org/api/indicators.json?fields=id%2Ccode%2Cnumerator%2Cdenominator&paging=false&filter=id:in:[fFd5hGDroLk,d5Ngfxa7lQ2,tMLFyuggLmB,mJubyzLqUjO]
import indicators from './cmr_indicators.json';
import MESSAGES from '../messages';

function fetcthDataElementUsedBy(projectDescriptor) {
    const dataElementsUsedByHesabu = [];
    const indicatorsById = {};

    indicators.indicators.forEach(indic => {
        indicatorsById[indic.id] = indic;
    });

    Object.keys(projectDescriptor.payment_rules).forEach(paymentRuleCode => {
        const paymentRule = projectDescriptor.payment_rules[paymentRuleCode];
        Object.keys(paymentRule.packages).forEach(packageCode => {
            const orbfPackage = paymentRule.packages[packageCode];
            Object.keys(orbfPackage.activities).forEach(activityCode => {
                const activity = orbfPackage.activities[activityCode];
                Object.keys(activity).forEach(state => {
                    const hesabuType = orbfPackage.activity_formulas[state]
                        ? 'activity_formula'
                        : 'activity_state';
                    if (state !== 'name' && state !== 'code') {
                        const deId = activity[state];

                        if (indicatorsById[deId]) {
                            const deRegex = /[a-zA-Z]{1}[a-zA-Z0-9]{10}/;
                            const dataElementIds = indicatorsById[
                                deId
                            ].numerator
                                .split(/#{([a-zA-Z]{1}[a-zA-Z0-9]{10})}/i)
                                .filter(ex => ex.match(deRegex));
                            dataElementIds.forEach(de => {
                                dataElementsUsedByHesabu.push({
                                    id: de,
                                    activityCode: activity.code,
                                    activityName: activity.name,
                                    state,
                                    frequency: orbfPackage.frequency,
                                    packageName: orbfPackage.name,
                                    paymentName: paymentRule.name,
                                    dhis2IndicatorId: deId,
                                    dhis2IndicatorName:
                                        indicatorsById[deId].name,
                                    hesabu: hesabuType,
                                });
                            });
                        } else {
                            dataElementsUsedByHesabu.push({
                                id: deId,
                                activityCode: activity.code,
                                activityName: activity.name,
                                state,
                                frequency: orbfPackage.frequency,
                                packageName: orbfPackage.name,
                                paymentName: paymentRule.name,
                                hesabu: hesabuType,
                            });
                        }
                    }
                }); // states
            }); // activities
            Object.keys(orbfPackage.formulas).forEach(formulaCode => {
                const formula = orbfPackage.formulas[formulaCode];
                const deId = formula.de_id;
                dataElementsUsedByHesabu.push({
                    id: deId,
                    activityCode: undefined,
                    state: undefined,
                    formulaCode,
                    formulaExpression: formula.expression,
                    formulaName: formula.name,
                    frequency: formula.frequency,
                    packageName: orbfPackage.name,
                    paymentName: paymentRule.name,
                    hesabu: 'package',
                });
            });
        }); // packages
        Object.keys(paymentRule.formulas).forEach(formulaCode => {
            const formula = paymentRule.formulas[formulaCode];
            const deId = formula.de_id;
            dataElementsUsedByHesabu.push({
                id: deId,
                activityCode: undefined,
                state: undefined,
                formulaCode,
                frequency: paymentRule.frequency,
                packageName: undefined,
                paymentName: paymentRule.name,
                hesabu: 'payment',
            });
        });
    }); // payments

    // to test on play
    // dataElementsUsedByHesabu[0].id = "hCVSHjcml9g";
    // dataElementsUsedByHesabu[100].id = "hCVSHjcml9g";
    return dataElementsUsedByHesabu;
}

const HesabuHint = ({ mapping, hesabuDescriptor }) => {
    const { formatMessage } = useSafeIntl();
    if (
        mapping === undefined ||
        hesabuDescriptor === null ||
        hesabuDescriptor.length === 0
    ) {
        return null;
    }
    const usedBy = fetcthDataElementUsedBy(hesabuDescriptor[0]).filter(
        de => de.id === mapping.id,
    );
    if (usedBy.length === 0) {
        return <></>;
    }

    return (
        <>
            <h3>{formatMessage(MESSAGES.hesabuHint)} </h3>
            <br />
            {usedBy.map((obj, index) => (
                <>
                    <ObjectDumper key={index} object={obj} />
                    <br />
                </>
            ))}
        </>
    );
};

HesabuHint.defaultProps = {
    mapping: undefined,
};

HesabuHint.propTypes = {
    mapping: PropTypes.object,
    hesabuDescriptor: PropTypes.array.isRequired,
};

export default HesabuHint;
