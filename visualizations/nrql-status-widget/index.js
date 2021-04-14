import React from "react";
import {
  Card,
  CardBody,
  HeadingText,
  NrqlQuery,
  Spinner,
  AutoSizer,
  Tooltip,
} from "nr1";
import { deriveValues } from "./utils";

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
      onClickUrl,
    } = this.props;
    const errors = [];

    const configuration = {
      criticalLabel,
      warningLabel,
      healthyLabel,
      warningThreshold,
      criticalThreshold,
    };

    if (isNaN(warningThreshold) && isNaN(criticalThreshold)) {
      configuration.thresholdType = "regex";
    } else if (!isNaN(warningThreshold) && !isNaN(criticalThreshold)) {
      configuration.thresholdType = "numeric";
      configuration.warningThreshold = parseFloat(warningThreshold);
      configuration.criticalThreshold = parseFloat(criticalThreshold);
      if (criticalThreshold && criticalThreshold === warningThreshold) {
        errors.push(
          "Critical and warning thresholds should not be the same value"
        );
      }
    } else {
      errors.push(
        "Threshold values are mixed types, they must both be numerics or all strings"
      );
    }

    if (configuration.thresholdType === "numeric") {
      if (["above", "below"].includes(thresholdDirection)) {
        configuration.thresholdDirection = thresholdDirection;
      } else {
        configuration.thresholdDirection = "above";
      }

      if (
        configuration.thresholdDirection === "above" &&
        configuration.warningThreshold > configuration.criticalThreshold
      ) {
        errors.push(
          "Warning threshold is higher than critical threshold, correct this or set your threshold direction to below"
        );
      } else if (
        configuration.thresholdDirection === "below" &&
        configuration.warningThreshold < configuration.criticalThreshold
      ) {
        errors.push(
          "Warning threshold is less than critical threshold, correct this or set your threshold direction to above"
        );
      }
    }

    if (!accountId) errors.push("Required: Account ID");
    if (!query) {
      errors.push("Required: Query eg. FROM TransactionError SELECT count(*)");
    } else {
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes("timeseries") || lowerQuery.includes("facet")) {
        errors.push(
          "Query contains timeseries and/or facet and should be removed"
        );
      }
    }
    if (!criticalThreshold) errors.push("Required: Critical threshold");
    if (!warningThreshold) errors.push("Required: Warning threshold");

    if (errors.length > 0) {
      return EmptyState(errors);
    }

    const bucketValue =
      !isNaN(timelineBucket) && timelineBucket > 0 ? timelineBucket : 1;
    const timeseriesValue = `TIMESERIES ${bucketValue} minute`;
    const untilValue = untilClause || "";
    const sinceClause = `SINCE ${bucketValue * 24} minutes ago`;

    let finalQuery = `${query} ${timeseriesValue} `;

    if (
      !query.toLowerCase().includes("since") &&
      !query.toLowerCase().includes("until")
    ) {
      finalQuery += ` ${sinceClause} ${untilValue}`;
    }

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
                return ErrorState(error.message || "", finalQuery);
              }

              const derivedValues = deriveValues(data, configuration);

              const {
                status,
                statusLabel,
                latestValue,
                timeseries,
              } = derivedValues;

              let metricValue = latestValue;
              if (!isNaN(latestValue) && decimalPlaces !== undefined) {
                metricValue = latestValue.toFixed(decimalPlaces);
              }

              if (metricValue === undefined || metricValue === null) {
                metricValue = "null";
              }

              return (
                <div
                  style={{
                    width,
                    height,
                    maxWidth: width,
                    maxHeight: height,
                    cursor: onClickUrl ? "pointer" : "default",
                  }}
                  className={`${status}-bg flex-container`}
                  onClick={
                    onClickUrl
                      ? () => window.open(onClickUrl, "_blank")
                      : undefined
                  }
                >
                  <div className="flex-col">
                    {displayMetric && (
                      <div
                        title={metricValue}
                        className="flex-item"
                        style={{
                          color: "white",
                          fontSize: "17vh",
                          width,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {metricValue}
                        {metricSuffix && (
                          <div
                            style={{
                              display: "inline",
                              fontSize: "14vh",
                              verticalAlign: "top",
                            }}
                          >
                            &nbsp;{metricSuffix}
                          </div>
                        )}
                        {metricLabel && (
                          <div style={{ marginTop: "-5vh", fontSize: "6vh" }}>
                            {metricLabel}
                          </div>
                        )}
                      </div>
                    )}
                    {statusLabel && (
                      <div
                        className="flex-item"
                        style={{
                          color: "white",
                          fontSize: displayMetric ? "10vh" : "17vh",
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
                        position: "absolute",
                        bottom: "0px",
                        fontSize: displayMetric ? "10vh" : "12vh",
                        display: "inline-flex",
                        paddingTop: "2vh",
                        paddingBottom: "2vh",
                        width,
                        // backgroundColor: "black",
                        backgroundColor: "#272727",
                        alignItems: "center",
                        justifyContent: "center",
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
                                width: "2.5vh",
                                height: "5.75vh",
                                marginRight: "1.75vh",
                                border: "1px solid white",
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

const EmptyState = (errors) => (
  <Card className="EmptyState">
    <CardBody className="EmptyState-cardBody">
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Status widget supports both numeric and string evaluation. String
        evaluation is performed with regex.
      </HeadingText>
      <br />
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Please amend any errors and supply the base configuration...
      </HeadingText>
      <div>
        {errors.map((error, i) => {
          return (
            <HeadingText
              key={i}
              spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
              type={HeadingText.TYPE.HEADING_4}
            >
              {error}
            </HeadingText>
          );
        })}
      </div>

      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_5}
      >
        Author: Kav P.
      </HeadingText>
    </CardBody>
  </Card>
);

const ErrorState = (error, query) => (
  <Card className="ErrorState">
    <CardBody className="ErrorState-cardBody">
      <HeadingText
        className="ErrorState-headingText"
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Oops! Something went wrong.
      </HeadingText>
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
        type={HeadingText.TYPE.HEADING_4}
      >
        {error}
      </HeadingText>
      {query && (
        <HeadingText
          spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
          type={HeadingText.TYPE.HEADING_4}
        >
          Query: {query}
        </HeadingText>
      )}
    </CardBody>
  </Card>
);
