import * as React from 'react';
import * as _ from 'lodash';
import plugins from './generic/plugins';

import { DataSourceConnector } from '../data-sources/DataSourceConnector';
import VisibilityActions from '../actions/VisibilityActions';
import VisibilityStore from '../stores/VisibilityStore';

export default class ElementConnector {
  static loadLayoutFromDashboard(elementsContainer: IElementsContainer, dashboard: IDashboardConfig): ILayouts {
    
    var layouts = {};
    _.each(dashboard.config.layout.cols, (totalColumns, key) => {

      let layoutIDs = {};
      var curCol = 0;
      var curRowOffset = 0;
      var maxRowHeight = 0;

      // Go over all elements in the dashboard and check their size
      layouts[key] = [];

      elementsContainer.elements.forEach(element => {
        let { id, size, location } = element;

        if (layoutIDs[id]) { return; }
        layoutIDs[id] = true;

        if (curCol > 0 && (curCol + size.w) > totalColumns) {
          curCol = 0;
          curRowOffset = maxRowHeight;
        }

        location = location || { x: -1, y: -1 };
        if (location.x !== 0 && location.x < 0) { location.x = curCol; }
        if (location.y !== 0 && location.y < 0) { location.y = curRowOffset; }

        layouts[key].push({
          'i': id,
          'x': location.x,
          'y': location.y,
          'w': size.w,
          'h': size.h
        });

        curCol += size.w;
        maxRowHeight = Math.max(curRowOffset + size.h, maxRowHeight);
      });
    });

    return layouts;
  }

  static loadElementsFromDashboard(dashboard: IElementsContainer, layout: ILayout[]): React.Component<any, any>[] {
    var elements = [];
    var elementId = {};
    var visibilityFlags = (VisibilityStore.getState() || {}).flags || {};

    dashboard.elements.forEach((element, idx) => {
      var ReactElement = plugins[element.type];
      var { id, dependencies, actions, props, title, subtitle, size, theme, location } = element;
      var layoutProps = _.find(layout, { 'i': id });

      if (dependencies && dependencies.visible && !visibilityFlags[dependencies.visible]) { 
        if (typeof visibilityFlags[dependencies.visible] === 'undefined') {
          let flagDependencies = DataSourceConnector.extrapolateDependencies({ value: dependencies.visible });
          let flag = {};
          flag[dependencies.visible] = flagDependencies.dataSources.value || true;

          (VisibilityActions.setFlags as any).defer(flag);
        } else {
          return; 
        }
      }

      if (elementId[id]) { return; }

      elementId[id] = true;
      elements.push(
        <div key={id}>
          <ReactElement 
            id={id + idx}
            dependencies={dependencies}
            actions={actions || {}}
            props={props || {}}
            title={title}
            subtitle={subtitle}
            layout={layoutProps}
            theme={theme}
          />
        </div>
      );
    });

    return elements;
  }

  static loadFiltersFromDashboard(dashboard: IDashboardConfig): {
    filters: React.Component<any, any>[],
    additionalFilters: React.Component<any, any>[]
  } {
    var filters = [];
    var additionalFilters = [];
    dashboard.filters.forEach((element, idx) => {
      var ReactElement = plugins[element.type];
      (element.first ? filters : additionalFilters).push(
        <ReactElement 
              key={idx} 
              dependencies={element.dependencies}
              actions={element.actions}
              title={element.title}
              subtitle={element.subtitle}
              icon={element.icon}
        />
      );
    });

    return { filters, additionalFilters };
  }
}