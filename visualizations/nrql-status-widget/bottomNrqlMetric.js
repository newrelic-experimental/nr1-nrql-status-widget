import React from 'react';
import { NrqlQuery, Spinner } from 'nr1';
import ErrorState from './errorState';
import { deriveValues } from './utils';

export default class NrqlMetric extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false
    };
  }

  render() {
    const {
      direction,
      rightStatus,
      leftStatus,
      fullWidth,
      width,
      query,
      accountId,
      configuration,
      decimalPlaces,
      metricSuffix,
      updateState,
      metricLabelLeft,
      metricLabelRight
    } = this.props;
    let { metricLabel } = this.props;

    const { initialized } = this.state;

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

          if (error && initialized === false) {
            return <ErrorState error={error.message || ''} query={query} />;
          }

          if (initialized === false) {
            this.setState({ initialized: true });
          }

          if (initialized === true && error) {
            setTimeout(() => {
              // eslint-disable-next-line
              console.log(`NRQL error for ${finalQuery} \nError: ${error}\nReloading...`);
              window.location.reload();
            }, 5000);
          }

          const derivedValues = deriveValues(data, configuration);

          const { status, latestValue } = derivedValues;
          let statusLabel = derivedValues.statusLabel;

          if (direction === 'right' && rightStatus !== statusLabel) {
            updateState({ rightStatus: statusLabel });
          } else if (direction === 'left' && leftStatus !== statusLabel) {
            updateState({ leftStatus: statusLabel });
          }

          if (direction === 'left' && rightStatus) {
            statusLabel = leftStatus || '';
          } else if (direction === 'right' && leftStatus) {
            statusLabel = rightStatus || '';
          }

          if (!statusLabel && direction === 'left' && !rightStatus) {
            statusLabel = null;
          } else if (!statusLabel && direction === 'right' && !leftStatus) {
            statusLabel = null;
          }

          let metricValue = latestValue;
          if (!isNaN(latestValue) && decimalPlaces !== undefined) {
            metricValue = latestValue.toFixed(decimalPlaces);
          }

          if (metricValue === undefined || metricValue === null) {
            metricValue = 'null';
          }

          if (metricLabel === undefined || metricLabel === '') {
            metricLabel = null;
          }

          if (direction === 'right' && metricLabelLeft) {
            metricLabel = '';
          } else if (direction === 'left' && metricLabelRight) {
            metricLabel = '';
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
                  {metricLabel !== null && metricLabel !== undefined && (
                    <div
                      style={{
                        marginTop: '-5vh',
                        fontSize: '6vh',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden'
                      }}
                    >
                      {metricLabel || <span>&nbsp;</span>}
                    </div>
                  )}
                </div>
                {statusLabel !== null && statusLabel !== undefined && (
                  <div
                    className="flex-item"
                    style={{
                      color: 'white',
                      fontSize: '10vh',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}
                  >
                    {statusLabel || <span>&nbsp;</span>}
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
