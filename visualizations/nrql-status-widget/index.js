import React from 'react';
import { NrqlQuery, Spinner, AutoSizer, Tooltip } from 'nr1';
import { deriveValues, generateMainErrors } from './utils';
import EmptyState from './emptyState';
import ErrorState from './errorState';

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

    const errors = generateMainErrors(
      criticalLabel,
      warningLabel,
      healthyLabel,
      warningThreshold,
      criticalThreshold,
      thresholdDirection,
      accountId,
      query
    );

    const configuration = {
      criticalLabel,
      warningLabel,
      healthyLabel,
      warningThreshold,
      criticalThreshold
    };

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

                  {displayTimeline && (
                    <div
                      className="flex-item"
                      style={{
                        position: 'absolute',
                        bottom: '0px',
                        fontSize: displayMetric ? '10vh' : '12vh',
                        display: 'inline-flex',
                        paddingTop: '2vh',
                        paddingBottom: '2vh',
                        width,
                        // backgroundColor: "black",
                        backgroundColor: '#272727',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {timeseries.map((ts, i) => {
                        const beginDate = new Date(ts.begin_time);
                        const endDate = new Date(ts.end_time);
                        const hoverText = `${beginDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`;

                        return (
                          <Tooltip
                            text={hoverText}
                            key={i}
                            placementType={Tooltip.PLACEMENT_TYPE.TOP}
                          >
                            <div
                              className={`${ts.status}-solid-bg`}
                              style={{
                                width: '2.5vh',
                                height: '5.75vh',
                                marginRight: '1.75vh',
                                border: '1px solid white'
                              }}
                            />
                          </Tooltip>
                        );
                      })}
                    </div>
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
