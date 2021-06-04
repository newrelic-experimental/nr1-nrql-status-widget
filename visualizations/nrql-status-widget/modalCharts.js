import React from 'react';
import {
  Modal,
  Button,
  LineChart,
  HeadingText,
  BillboardChart,
  AreaChart,
  BarChart,
  StackedBarChart,
  PieChart,
  SparklineChart,
  HeatmapChart,
  HistogramChart,
  JsonChart,
  TableChart,
  FunnelChart,
  ScatterChart
} from 'nr1';

export default class ModalCharts extends React.Component {
  renderChart = (accountId, chartType, query) => {
    switch (chartType) {
      case 'area': {
        return <AreaChart accountId={accountId} query={query} />;
      }
      case 'bar': {
        return <BarChart accountId={accountId} query={query} />;
      }
      case 'billboard': {
        return <BillboardChart accountId={accountId} query={query} />;
      }
      case 'funnel': {
        return <FunnelChart accountId={accountId} query={query} />;
      }
      case 'heatmap': {
        return <HeatmapChart accountId={accountId} query={query} />;
      }
      case 'histogram': {
        return <HistogramChart accountId={accountId} query={query} />;
      }
      case 'json': {
        return <JsonChart accountId={accountId} query={query} />;
      }
      case 'line': {
        return <LineChart accountId={accountId} query={query} />;
      }
      case 'pie': {
        return <PieChart accountId={accountId} query={query} />;
      }
      case 'scatter': {
        return <ScatterChart accountId={accountId} query={query} />;
      }
      case 'sparkline': {
        return <SparklineChart accountId={accountId} query={query} />;
      }
      case 'stackedbar': {
        return <StackedBarChart accountId={accountId} query={query} />;
      }
      case 'table': {
        return <TableChart accountId={accountId} query={query} />;
      }
      default: {
        return 'Unsupported chart type';
      }
    }
  };

  render() {
    const { open, close, queries, accountId } = this.props;

    return (
      <Modal hidden={!open} onClose={close}>
        <>
          {queries.map((q, i) => {
            return (
              <div
                key={i}
                style={{
                  padding: '7px',
                  height:
                    q.height && !isNaN(q.height) ? `${q.height}px` : undefined
                }}
              >
                {!q.hideTitle && (
                  <HeadingText type={HeadingText.TYPE.HEADING_4}>
                    {q.chartTitle}
                  </HeadingText>
                )}
                {this.renderChart(accountId, q.chartType, q.query)}
              </div>
            );
          })}
          <div style={{ paddingTop: '10px' }}>
            <Button onClick={close}>Close</Button>
          </div>
        </>
      </Modal>
    );
  }
}
