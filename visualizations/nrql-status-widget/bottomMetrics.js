import React from 'react';
import { generateErrorsAndConfig } from './utils';
import NrqlMetric from './bottomNrqlMetric';

export default class BottomMetrics extends React.Component {
  render() {
    const { width, mainProps } = this.props;

    const {
      accountId,
      queryLeft,
      thresholdDirectionLeft,
      criticalThresholdLeft,
      criticalLabelLeft,
      warningThresholdLeft,
      warningLabelLeft,
      healthyLabelLeft,
      metricSuffixLeft,
      decimalPlacesLeft,
      metricLabelLeft,
      queryRight,
      thresholdDirectionRight,
      criticalThresholdRight,
      criticalLabelRight,
      warningThresholdRight,
      warningLabelRight,
      healthyLabelRight,
      metricSuffixRight,
      decimalPlacesRight,
      metricLabelRight
    } = mainProps;

    let leftMetric = null;
    let rightMetric = null;

    if (queryLeft) {
      leftMetric = generateErrorsAndConfig(
        criticalLabelLeft,
        warningLabelLeft,
        healthyLabelLeft,
        warningThresholdLeft,
        criticalThresholdLeft,
        thresholdDirectionLeft,
        accountId,
        queryLeft
      );
    }

    if (queryRight) {
      rightMetric = generateErrorsAndConfig(
        criticalLabelRight,
        warningLabelRight,
        healthyLabelRight,
        warningThresholdRight,
        criticalThresholdRight,
        thresholdDirectionRight,
        accountId,
        queryRight
      );
    }

    if (queryRight === null && queryLeft === null) {
      return '';
    }

    const fullWidth = !(queryRight && queryLeft);

    return (
      <div
        className="flex-item"
        style={{
          position: 'absolute',
          bottom: '6.75vh',
          fontSize: '10vh',
          display: 'inline-flex',
          paddingTop: '2vh',
          paddingBottom: '2vh',
          width,
          // alignItems: 'center',
          justifyContent: 'space-around'
        }}
      >
        {queryLeft && (
          <NrqlMetric
            fullWidth={fullWidth}
            width={width}
            query={queryLeft}
            accountId={accountId}
            configuration={leftMetric.configuration}
            decimalPlaces={decimalPlacesLeft}
            metricSuffix={metricSuffixLeft}
            metricLabel={metricLabelLeft}
          />
        )}
        {queryRight && (
          <NrqlMetric
            fullWidth={fullWidth}
            width={width}
            query={queryRight}
            accountId={accountId}
            configuration={rightMetric.configuration}
            decimalPlaces={decimalPlacesRight}
            metricSuffix={metricSuffixRight}
            metricLabel={metricLabelRight}
          />
        )}
      </div>
    );
  }
}
