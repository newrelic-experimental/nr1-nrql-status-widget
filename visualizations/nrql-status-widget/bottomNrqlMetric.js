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
      fullWidth,
      width,
      query,
      accountId,
      configuration,
      decimalPlaces,
      metricSuffix,
      metricLabel
    } = this.props;
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
