import * as React from 'react';
import { GenericComponent } from './GenericComponent';
import AccessibleFakeInkedButton from 'react-md/lib/Helpers/AccessibleFakeInkedButton';
import FontIcon from 'react-md/lib/FontIcons/FontIcon';
import DialogContainer from 'react-md/lib/Dialogs/DialogContainer';
import { DateRange } from 'react-date-range';
import * as moment from 'moment';

const defaultRanges = {
  'Today': {
    startDate: function startDate(now: moment.Moment) {
      return now;
    },
    endDate: function endDate(now: moment.Moment) {
      return now;
    }
  },

  'Yesterday': {
    startDate: function startDate(now: moment.Moment) {
      return now.add(-1, 'days');
    },
    endDate: function endDate(now: moment.Moment) {
      return now.add(-1, 'days');
    }
  },

  'Last 7 Days': {
    startDate: function startDate(now: moment.Moment) {
      return now.add(-7, 'days');
    },
    endDate: function endDate(now: moment.Moment) {
      return now;
    }
  },

  'Last 30 Days': {
    startDate: function startDate(now: moment.Moment) {
      return now.add(-30, 'days');
    },
    endDate: function endDate(now: moment.Moment) {
      return now;
    }
  },

  'Last 90 Days': {
    startDate: function startDate(now: moment.Moment) {
      return now.add(-90, 'days');
    },
    endDate: function endDate(now: moment.Moment) {
      return now;
    }
  }
};

const styles = {
    button: {
        userSelect: 'none',
    } as React.CSSProperties,
    container: {
        position: 'relative',
        float: 'left',
        zIndex: 17,
    } as React.CSSProperties,
    animateOpen: {
        transition: '.3s',
        transform: 'scale(1.0,1.0)',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    } as React.CSSProperties,
    animateClose: {
        transform: 'scale(1.0,0)',
        transition: '0s',
    } as React.CSSProperties,
    list: {
        position: 'absolute',
        top: '0px',
        left: '0px',
    } as React.CSSProperties
};

// using styles from the select field menu
const classNames = {
    menu: ['md-inline-block', 'md-menu-container', 'md-menu-container--menu-below', 'md-select-field-menu',
        'md-select-field-menu--stretch', 'md-select-field--toolbar', ''],
    label: ['md-floating-label', 'md-floating-label--floating', ''],
};

export default class DatePickerFilter extends GenericComponent<any, any> {

    static defaultProps = {
      title: 'Timespan',
      subtitle: 'Select range',
      icon: 'more_vert'
    };

    constructor(props: any) {
      super(props);

      this.handleSelect = this.handleSelect.bind(this);
      this.showOverlay = this.showOverlay.bind(this);
      this.hideOverlay = this.hideOverlay.bind(this);
      this.hideOverlayCancel = this.hideOverlayCancel.bind(this);

      this.state = {
        visible: false,
        selectedValue: ''
      };
    }

    /**
     * Handle new dateRange selection
     * @param {Object} newDateRange
     */
    handleSelect(newDateRange: any) {
      let selectedValue = this.toISODateRange(newDateRange);

      if (this.state.selectedValue !== selectedValue) {
        this.setState({
            selectedValue
        });
      }
    }

    showOverlay() {
      this.setState({
          visible: true
      });
    }

    hideOverlay() {
      this.setState({ visible: false });
      this.trigger('onChange', this.state.selectedValue);
    }

    hideOverlayCancel() {
      this.setState({ visible: false });
    }

    /**
     * Construct ISO8601 Date interval string from two dates
     * startDate is before than endDate
     *
     * @param {moment} startDate
     * @param {moment} endDate
     * @returns {string} ISO8601 Date interval string
     */
    toISODateRange(dateRange: any) {
      let {startDate, endDate} = dateRange;
      let startDateISOString = `${startDate.format('YYYY-MM-DD')}T00:00:00.000Z`;
      let endDateISOString = `${endDate.format('YYYY-MM-DD')}T23:59:59.999Z`;
      return startDateISOString + '/' + endDateISOString;
    }

    /**
     * Construct string to show interval date from a date string in ISO8601
     *
     * @param {string} selectedValue
     * @returns {string}
     */
    toPrettyDateRange(selectedValue: string) {
      let dates = selectedValue.split('/');
      return dates[0].split('T')[0] + ' to ' + dates[1].split('T')[0];
    }

    render() {

      const { title, subtitle, icon } = this.props;
      const { visible, selectedValue} = this.state;

      const paperStyle = classNames.menu.join(' ') + (visible ? 'md-paper md-paper--1' : '');
      const labelStyle = classNames.label.join(' ') + (visible ? 'md-floating-label--active' : '');

      const selectDateRange = selectedValue ? this.toPrettyDateRange(selectedValue) : (subtitle || 'Select range');

      let startDate = selectedValue ? moment.utc(selectedValue.split('/')[0]) : '';
      let endDate = selectedValue ? moment.utc(selectedValue.split('/')[1]) : '';

      // Application insights only store the information for the last 90 days
      let minDate = moment().subtract(90, 'days');
      let maxDate = moment().add(1, 'days');

      let theme = {
        Calendar: {
          width       : 300,
        },
        PredefinedRanges: {
          marginLeft  : 20,
          marginRight : 20,
          marginTop   : 10
        },
        PredefinedRangesItem: {
          fontSize    : 14,
          textAlign   : 'center',
        },
        PredefinedRangesItemActive: {
          color       : '#03a9f4',
        },
        MonthAndYear    : {
          background  : '#03a9f4',
          color       : '#fff',
          fontSize    : 14,
          fontWeight  : 'bold'
        },
        MonthButton     : {
          background  : '#03a9f4'
        },
        Day             : {
          transition  : 'transform .1s ease, box-shadow .1s ease, background .1s ease',
          fontSize    : 14,
        },
        DaySelected    : {
          background   : '#03a9f4'
        },
        DayActive    : {
          background   : '#03a9f4',
          boxShadow    : 'none'
        },
        DayInRange     : {
          background   : '#b3e5fc',
          color        : '#000'
        },
        DayHover       : {
          background   : '#ffffff',
          transform    : 'scale(1.1) translateY(-10%)',
          boxShadow    : '0 2px 4px rgba(0, 0, 0, 0.4)'
        }
      };

      const actions = [
        { primary: true, children: 'done', onClick: this.hideOverlay },
        { secondary: true, children: 'clear', onClick: this.hideOverlayCancel }
      ];

      return (
        <div className="filters">

          <AccessibleFakeInkedButton
              className={paperStyle}
              onClick={this.showOverlay}
              aria-haspopup="true"
              aria-expanded={visible}
              style={styles.button}
          >
            <label className={labelStyle}>{title}</label>
            <div className="md-icon-separator md-text-field md-select-field--btn md-text-field--floating-margin">
              <span className="md-value md-icon-text">{selectDateRange}</span>
              <FontIcon>arrow_drop_down</FontIcon>
            </div>
          </AccessibleFakeInkedButton>

          <DialogContainer
              id="dateRangePicker"
              onHide={this.hideOverlay}
              visible={visible}
              actions={actions}
              aria-label="Daterange Picker"
          >
            <DateRange
                linkedCalendars={true}
                calendars={1}
                startDate={startDate}
                endDate={endDate}
                minDate={minDate}
                maxDate={maxDate}
                // monday as first day of week
                firstDayOfWeek={1}
                ranges={defaultRanges}
                onInit={this.handleSelect}
                onChange={this.handleSelect}
                theme={theme}
            />

          </DialogContainer>
        </div>
      );
    }
}