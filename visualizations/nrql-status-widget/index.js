import React from 'react';
import { NrqlQuery, Spinner, AutoSizer } from 'nr1';
import {
  deriveValues,
  generateErrorsAndConfig,
  generateSloErrors
} from './utils';
import EmptyState from './emptyState';
import ErrorState from './errorState';
import Timeline from './timeline';
import BottomMetrics from './bottomMetrics';
import ModalCharts from './modalCharts';

export default class NrqlStatusWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      initialized: false
    };
  }

  // componentDidMount() {
  //   const {
  //     sloId,
  //     sloDays,
  //     sloTarget,
  //     sloBudget,
  //     sloBar,
  //     sloDaysToView
  //   } = this.props;

  //   const sloConfig = {
  //     sloId,
  //     sloDays,
  //     sloTarget,
  //     sloBar,
  //     sloBudget,
  //     sloDaysToView
  //   };
  // }

  modalClose = () => {
    this.setState({ modalOpen: false });
  };

  render() {
    const { modalOpen, initialized } = this.state;
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
      onClickUrl,
      queryLeft,
      thresholdDirectionLeft,
      criticalThresholdLeft,
      criticalLabelLeft,
      warningThresholdLeft,
      warningLabelLeft,
      healthyLabelLeft,
      queryRight,
      thresholdDirectionRight,
      criticalThresholdRight,
      criticalLabelRight,
      warningThresholdRight,
      warningLabelRight,
      healthyLabelRight,
      modalQueries,
      sloId,
      sloDays,
      sloTarget,
      sloBudget,
      sloBar,
      sloDaysToView
    } = this.props;
    const validModalQueries = modalQueries.filter(
      q => q.query && q.chartType && q.query.length > 5
    );

    const sloConfig = {
      sloId,
      sloDays,
      sloTarget,
      sloBar,
      sloBudget,
      sloDaysToView
    };

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

    const { errors, configuration } = generateErrorsAndConfig(
      criticalLabel,
      warningLabel,
      healthyLabel,
      warningThreshold,
      criticalThreshold,
      thresholdDirection,
      accountId,
      query,
      onClickUrl,
      validModalQueries
    );

    const sloErrors = generateSloErrors(sloConfig);

    if (errors.length > 0 || sloErrors.length > 0) {
      return <EmptyState errors={[...errors, ...sloErrors]} />;
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

    let chartOnClick;

    if (onClickUrl) {
      chartOnClick = () => window.open(onClickUrl, '_blank');
    }

    if (validModalQueries.length > 0) {
      chartOnClick = () => this.setState({ modalOpen: true });
    }

    return (
      <AutoSizer>
        {({ width, height }) => (
          <>
            <ModalCharts
              open={modalOpen}
              close={this.modalClose}
              queries={validModalQueries}
              accountId={accountId}
            />
            <NrqlQuery
              query={finalQuery}
              accountId={parseInt(accountId)}
              pollInterval={NrqlQuery.AUTO_POLL_INTERVAL}
            >
              {({ data, loading, error }) => {
                if (loading) {
                  return <Spinner />;
                }

                if (error && initialized === false) {
                  return (
                    <ErrorState
                      error={error.message || ''}
                      query={finalQuery}
                    />
                  );
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
                      maxHeight: height
                    }}
                    className={`${status}-bg flex-container`}
                  >
                    <div className="flex-col">
                      {displayMetric && (
                        <div
                          onClick={chartOnClick}
                          title={metricValue}
                          className="flex-item"
                          style={{
                            color: 'white',
                            fontSize: '17vh',
                            width,
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            marginTop:
                              queryRight || queryLeft ? '-19vh' : '0px',
                            cursor: chartOnClick ? 'pointer' : 'default'
                          }}
                        >
                          {metricValue}
                          {metricSuffix && (
                            <div
                              style={{
                                display: 'inline',
                                fontSize: '14vh',
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
                      )}
                      {statusLabel && (
                        <div
                          className="flex-item"
                          style={{
                            color: 'white',
                            fontSize: displayMetric ? '10vh' : '17vh',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden'
                          }}
                        >
                          {statusLabel}
                        </div>
                      )}
                    </div>

                    <BottomMetrics
                      leftMetric={leftMetric}
                      rightMetric={rightMetric}
                      displayTimeline={displayTimeline}
                      width={width}
                      height={height}
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
          </>
        )}
      </AutoSizer>
    );
  }
}
