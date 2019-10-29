import { IFormatTest } from './formats';
import bars from './bars';
import filter from './filter';
import flags from './flags';
import retention from './retention';
import scorecard from './scorecard';
import timeline from './timeline';
import timespan from './timespan';
import filtered_samples from './filtered_samples';

export const formatTests = <IDict<IFormatTest | IFormatTest[]>> { 
  bars, 
  filter, 
  flags, 
  retention, 
  scorecard, 
  timeline, 
  timespan, 
  filtered_samples 
};