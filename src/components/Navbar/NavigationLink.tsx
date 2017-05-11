import * as React from 'react'
import { Link } from 'react-router';

export default class NavigationLink extends React.PureComponent<any, any> {
  // NOTE: Don't try using Stateless (function) component here. `ref` is
  // required by React-MD/AccessibleFakeButton, but Stateless components
  // don't have one by design:
  // https://github.com/facebook/react/issues/4936
  render () {
    const { href, as, children, ..._props } = this.props
    return (
      <div {..._props} style={{padding: 0}}>
        <Link href={href} to={null}>
          <a className='md-list-tile md-list-tile--mini' style={{width: '100%', overflow: 'hidden'}}>
            {children}
          </a>
        </Link>
      </div>
    )
  }
}