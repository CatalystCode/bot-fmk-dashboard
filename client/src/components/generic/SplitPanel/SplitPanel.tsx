import * as React from 'react';
import * as _ from 'lodash';
import * as moment from 'moment';

import { GenericComponent, IGenericProps, IGenericState } from '../GenericComponent';
import { Card, CardText } from 'react-md/lib/Cards';
import FontIcon from 'react-md/lib/FontIcons';
import Button from 'react-md/lib/Buttons/Button';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';
import List from 'react-md/lib/Lists/List';
import ListItem from 'react-md/lib/Lists/ListItem';
import Detail from '../Detail';
import Table from '../Table';
import { ITableProps, ITableState, ITableColumnProps } from '../Table/Table';
import Avatar from 'react-md/lib/Avatars';

import utils from '../../../utils';

const styles = {
  lhs: {
    position: 'absolute',
    width: '20%',
    height: '100%',
    overflow: 'scroll',
    borderRight: 'solid 1px #eee',
  } as React.CSSProperties,
  rhs: {
    position: 'absolute',
    width: '80%',
    height: '100%',
    left: '20%',
  } as React.CSSProperties
};

export interface ISplitViewProps extends ITableProps {
  props: {
    checkboxes?: boolean;
    rowClassNameField?: string;
    hideBorders?: boolean;
    compact?: boolean;
    cols: ITableColumnProps[],
    defaultRowsPerPage?: number;
    group: {
      field?: string;
      secondaryField?: string;
      countField?: string;
    }
  };
}

export interface ISplitViewState extends ITableState {
  values: Object[];
  groups: Object[];
  rowIndex: number;
  rowsPerPage: number;
  currentPage: number;
}

export default class SplitPanel extends GenericComponent<ISplitViewProps, ISplitViewState> {

  state = {
    groups: [],
    values: [],
    selectedIndex: -1,
    rowIndex: 0,
    rowsPerPage: 10,
    currentPage: 1,
  };

  constructor(props: ISplitViewProps) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  componentWillUpdate(nextProps: any, nextState: any) {
    let { groups } = nextState;
    let self = this;
    if (!this.state.groups && groups && groups.length > 0) {
      // automatically select first group list item
      try {
        if (typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(() => {
            self.handleClick(groups[0], 0);
          });
        } else {
          window.setTimeout(() => self.handleClick(groups[0], 0), 100);
        }
      } catch (e) {
        console.error(e); /* tslint:disable-line */
      }
    }
  }

  render() {
    const { props } = this.props;
    const { cols, group, hideBorders, compact } = props;
    const { groups, values } = this.state;

    const field = group.field || cols[0].field;
    const countField = group.countField || cols[props.cols.length - 1].field;

    if (!groups) {
      return <CircularProgress key="loading" id="spinner" />;
    }

    const listItems = groups.map((item, i) => {
      const primaryText = item[field];
      let secondaryText = '';
      if ( group.secondaryField ) {
        secondaryText = item[group.secondaryField] || '';
      }
      const badge = item[countField] ? <Avatar>{utils.kmNumber(item[countField])}</Avatar> : null;
      const active = (i === this.state.selectedIndex) ? true : false;
      return (
        <ListItem
          key={i}
          primaryText={primaryText}
          secondaryText={secondaryText}
          rightAvatar={badge}
          onClick={this.handleClick.bind(this, item, i)}
          active={active}
        />
      );
    });

    const table = (!values || values.length === 0) ?
      <CircularProgress key="loading" id="spinner" />
      : (
        <Table
          props={this.props.props}
          dependencies={this.props.dependencies}
          actions={this.props.actions || {}}
          title={this.props.title}
          subtitle={this.props.subtitle}
          layout={this.props.layout}
        />
      );

    return (
      <Card className={hideBorders ? 'hide-borders' : ''}>
          <div style={styles.lhs} className="split-view">
            <List>
              {listItems}
            </List>
          </div>

          <div style={styles.rhs} >
            {table}
          </div>
      </Card>
    );
  }

  handleClick(group: any, index: number, event?: UIEvent) {
    if (event) {
      event.stopPropagation();
    }
    
    this.setState({ selectedIndex: index, values: [] });
    this.trigger('select', group);
  }
}