import React from 'react';
import NrqlMetric from './bottomNrqlMetric';

export default class BottomMetrics extends React.Component {
  render() {
    const {
      leftMetric,
      rightMetric,
      width,
      mainProps,
      displayTimeline
    } = this.props;

    const {
      accountId,
      queryLeft,
      metricSuffixLeft,
      decimalPlacesLeft,
      metricLabelLeft,
      queryRight,
      metricSuffixRight,
      decimalPlacesRight,
      metricLabelRight
    } = mainProps;

    if (queryRight === null && queryLeft === null) {
      return '';
    }

    const fullWidth = !(queryRight && queryLeft);

    return (
      <div
        className="flex-item"
        style={{
          position: 'absolute',
          bottom: displayTimeline ? '6.75vh' : '0px',
          fontSize: '10vh',
          display: 'inline-flex',
          paddingTop: '2vh',
          paddingBottom: displayTimeline ? '2vh' : '0px',
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
