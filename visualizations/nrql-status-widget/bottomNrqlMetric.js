import React from 'react';
import { NrqlQuery, Spinner } from 'nr1';
import ErrorState from './errorState';
import { deriveValues } from './utils';

export default class NrqlMetric extends React.Component {
  render() {
    const {
      fullWidth,
      width,
      query,
      accountId,
      configuration,
      decimalPlaces,
      metricSuffix,
      metricLabel
    } = this.props;

    return (
      <NrqlQuery
        query={query}
        accountId={parseInt(accountId)}
        pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
      >
        {({ data, loading, error }) => {
          if (loading) {
            return <Spinner />;
          }

          if (error) {
            return <ErrorState error={error.message || ''} query={query} />;
          }

          const derivedValues = deriveValues(data, configuration);

          const { status, statusLabel, latestValue } = derivedValues;

          let metricValue = latestValue;
          if (!isNaN(latestValue) && decimalPlaces !== undefined) {
            metricValue = latestValue.toFixed(decimalPlaces);
          }

          if (metricValue === undefined || metricValue === null) {
            metricValue = 'null';
          }

          return (
            <div
              style={{ width: fullWidth ? width : width / 2 }}
              className={`${status}-bg flex-container`}
            >
              <div className="flex-col">
                <div
                  title={metricValue}
                  className="flex-item"
                  style={{
                    color: 'white',
                    fontSize: '12vh',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}
                >
                  {metricValue}
                  {metricSuffix && (
                    <div
                      style={{
                        display: 'inline',
                        fontSize: '10vh',
                        verticalAlign: 'top',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden'
                      }}
                    >
                      &nbsp;{metricSuffix}
                    </div>
                  )}
                  {metricLabel && (
                    <div
                      style={{
                        marginTop: '-5vh',
                        fontSize: '6vh',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden'
                      }}
                    >
                      {metricLabel}
                    </div>
                  )}
                </div>
                {statusLabel && (
                  <div
                    className="flex-item"
                    style={{
                      color: 'white',
                      fontSize: '10vh',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}
                  >
                    {statusLabel}
                  </div>
                )}
              </div>
            </div>
          );
        }}
      </NrqlQuery>
    );
  }
}
