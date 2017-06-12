import * as moment from 'moment';

export default {
  kmNumber: (num: number): string => {
    return (
      num > 999999 ?
        (num / 1000000).toFixed(1) + 'M' :
        num > 999 ?
          (num / 1000).toFixed(1) + 'K' : num.toString());
  },

  ago: (date: Date): string => {
    return moment(date).fromNow();
  }
};