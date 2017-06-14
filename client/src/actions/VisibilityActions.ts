import alt, { AbstractActions } from '../alt';

interface IVisibilityActions {
  setFlags(flags: IDict<boolean>): any;
  turnFlagOn(flagName: string): any;
  turnFlagOff(flagName: string): any;
}

class VisibilityActions extends AbstractActions implements IVisibilityActions {
  constructor(alt: AltJS.Alt) {
    super(alt);
  }

  setFlags(flags: IDict<boolean>): any {
    return flags;
  }

  initializeFlag(flagName: string): any {
    
  }

  turnFlagOn(flagName: string): any {
    let flag = {};
    flag[flagName] = true;
    return flag;
  }
  turnFlagOff(flagName: string): any {
    let flag = {};
    flag[flagName] = false;
    return flag;
  }
}

const visibilityActions = alt.createActions<IVisibilityActions>(VisibilityActions);

export default visibilityActions;
