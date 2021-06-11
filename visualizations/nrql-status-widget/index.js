import React from 'react';
import { PlatformStateContext } from 'nr1';
import StatusWidget from './status-widget';

export default class StatusWidgetRoot extends React.Component {
  render() {
    return (
      <PlatformStateContext.Consumer>
        {platformState => {
          return (
            <StatusWidget timeRange={platformState.timeRange} {...this.props} />
          );
        }}
      </PlatformStateContext.Consumer>
    );
  }
}
