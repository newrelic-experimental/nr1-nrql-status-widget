import React from 'react';
import { NrqlQuery, Spinner, AutoSizer } from 'nr1';
import { deriveValues, generateErrorsAndConfig } from './utils';
import EmptyState from './emptyState';
import ErrorState from './errorState';
import Timeline from './timeline';
import BottomMetrics from './bottomMetrics';

export default class NrqlStatusWidget extends React.Component {
  render() {
    const {
      accountId,
      query,
      timelineBucket,
      untilClause,
      displayTimeline,
      thresholdDirection,
      criticalThreshold,
      criticalLabel,
      warningThreshold,
      warningLabel,
      healthyLabel,
      displayMetric,
      metricLabel,
      metricSuffix,
      decimalPlaces,
      onClickUrl
    } = this.props;

    const { errors, configuration } = generateErrorsAndConfig(
      criticalLabel,
      warningLabel,
      healthyLabel,
      warningThreshold,
      criticalThreshold,
      thresholdDirection,
      accountId,
      query
    );

    if (errors.length > 0) {
      return <EmptyState errors={errors} />;
    }

    const bucketValue =
      !isNaN(timelineBucket) && timelineBucket > 0 ? timelineBucket : 1;
    const timeseriesValue = `TIMESERIES ${bucketValue} minute`;
    const untilValue = untilClause || '';
    const sinceClause = `SINCE ${bucketValue * 24} minutes ago`;

    let finalQuery = `${query} ${timeseriesValue} `;

    if (
      !query.toLowerCase().includes('since') &&
      !query.toLowerCase().includes('until')
    ) {
      finalQuery += ` ${sinceClause} ${untilValue}`;
    }

    // eslint-disable-next-line
    console.log(`Query: ${finalQuery}`);

    return (
      <AutoSizer>
        {({ width, height }) => (
          <NrqlQuery
            query={finalQuery}
            accountId={parseInt(accountId)}
            pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
          >
            {({ data, loading, error }) => {
              if (loading) {
                return <Spinner />;
              }

              if (error) {
                return (
                  <ErrorState error={error.message || ''} query={finalQuery} />
                );
              }

              const derivedValues = deriveValues(data, configuration);

              const {
                status,
                statusLabel,
                latestValue,
                timeseries
              } = derivedValues;

              let metricValue = latestValue;
              if (!isNaN(latestValue) && decimalPlaces !== undefined) {
                metricValue = latestValue.toFixed(decimalPlaces);
              }

              if (metricValue === undefined || metricValue === null) {
                metricValue = 'null';
              }

              return (
                <div
                  style={{
                    width,
                    height,
                    maxWidth: width,
                    maxHeight: height,
                    cursor: onClickUrl ? 'pointer' : 'default'
                  }}
                  className={`${status}-bg flex-container`}
                  onClick={
                    onClickUrl
                      ? () => window.open(onClickUrl, '_blank')
                      : undefined
                  }
                >
                  <div className="flex-col">
                    {displayMetric && (
                      <div
                        title={metricValue}
                        className="flex-item"
                        style={{
                          color: 'white',
                          fontSize: '17vh',
                          width,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      >
                        {metricValue}
                        {metricSuffix && (
                          <div
                            style={{
                              display: 'inline',
                              fontSize: '14vh',
                              verticalAlign: 'top'
                            }}
                          >
                            &nbsp;{metricSuffix}
                          </div>
                        )}
                        {metricLabel && (
                          <div style={{ marginTop: '-5vh', fontSize: '6vh' }}>
                            {metricLabel}
                          </div>
                        )}
                      </div>
                    )}
                    {statusLabel && (
                      <div
                        className="flex-item"
                        style={{
                          color: 'white',
                          fontSize: displayMetric ? '10vh' : '17vh'
                        }}
                      >
                        {statusLabel}
                      </div>
                    )}
                  </div>

                  <BottomMetrics
                    displayTimeline={displayTimeline}
                    width={width}
                    mainProps={this.props}
                  />

                  {displayTimeline && (
                    <Timeline
                      displayMetric={displayMetric}
                      timeseries={timeseries}
                      width={width}
                    />
                  )}
                </div>
              );
            }}
          </NrqlQuery>
        )}
      </AutoSizer>
    );
  }
}
