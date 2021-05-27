import React from 'react';
import { Modal, Button, BillboardChart, LineChart, HeadingText } from 'nr1';

export default class ModalCharts extends React.Component {
  renderChart = (accountId, chartType, query) => {
    switch (chartType) {
      case 'billboard': {
        return <BillboardChart accountId={accountId} query={query} />;
      }
      case 'line': {
        return <LineChart accountId={accountId} query={query} />;
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
              <div key={i} style={{ padding: '7px' }}>
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
