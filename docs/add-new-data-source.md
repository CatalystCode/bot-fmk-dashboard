# Adding a new Data Source to Ibex Dashboard

There are three types of data sources existing in Ibex today:

1. Unchanging data source - The source for the data remains unchanging (while the state is updatable)
2. Direct API calls - The data is received by querying a remote API
3. Server API calls - The data is received by querting the server (This approach is used for APIs which SDKs require Node.js)

Let's see how to create a general data source that:
* Uses an external API
* That API requires a `username` and `password`
* We can send a string query to that API
* We can add parameters to that query

## Connection 
Connection types are used to store authentication information for the remote APIs.
While a Connection is not required for unchanging data sources, defining a connection once, enable different data sources to query the same API with the same credentials.

Under `/client/src/data-sources/connections` create a new file like this (for the sake of this article, we'll use the name 'new-connection'):

`new-connection.tsx`:

```tsx
import * as React from 'react';
import { IConnection, ConnectionEditor, IConnectionProps } from './Connection';

/** 
 * This class is used to define the parameters for the connection
 * as well as the editor for the connection
 */
export default class NewConnection implements IConnection {
  type = 'new-connection';
  params = [ 'username', 'password' ];
  editor = AzureConnectionEditor;
}

/**
 * In case not all the parameters are filled up, or the user wants to edit the parameters
 * they can use this class to edit the those parameters
 */
class NewConnectionEditor extends ConnectionEditor<IConnectionProps, any> {

  render() {
    return (
      <div>...</div>
    );
  }

}
```

Then, do to `/client/src/data-sources/connections/index.ts` and add your new connection type:

```ts
import NewConnection from './new-connection';

var connectionTypes = [ 
  ...,
  NewConnection ];

```

## Data Source Creation
After creating the connection type, we need to define the data source and its options.

Under `/client/src/data-sources/plugins` create a new file like this (for the sake of this article, we'll use the name 'new-data-source'):

`new-data-source.ts`:

```ts
import * as request from 'xhr-request';
import { DataSourcePlugin, IOptions } from './DataSourcePlugin';
import { DataSourceConnector } from '../DataSourceConnector';
import NewConnection from '../connections/new-connection';

let connectionType = new GraphQLConnection();

interface INewDataSourceParams {
  query: string;
  parameters: Object;
}

export default class NewDataSource extends DataSourcePlugin<INewDataSourceParams> {
  type = 'NewDataSource'; // The name of the data source to be used in a template
  defaultProperty = 'data'; // The property holding the default value when adding this data source as a dependency
  connectionType = connectionType.type;

  constructor(options: IOptions<INewDataSourceParams>, connections: IDict<IStringDictionary>) {
    super(options, connections);

    // this._props.params is of type INewDataSourceParams, and will hold the requested pararms
    this.validateParams(this._props.params);
  }

  /**
   * This method will be called each time the dependencies for this data source are updated
   */
  dependenciesUpdated(dependencies: any) {

    // Ensure dependencies exist
    const isAnyDependencyMissing = Object.keys(this.getDependencies()).some(key => dependencies[key] == null);
    if (isAnyDependencyMissing) {
      return dispatch => dispatch();
    }

    // Validate connection
    const connection = this.getConnection();
    const { username, password } = connection;
    if (!connection || !username || !password) {
      return dispatch => dispatch();
    }

    const params = this.getParams() || ({} as INewDataSourceParams);
    const query = params.query || '';
    const parameters = dependencies['parameters'] || params.variables;

    return dispatch => {
      request('https://reqres.in/api/users', {
        method: 'GET',
        json: true,
        /**
         * Please notice, in this sample, this API required no username/password/query/params
         */
        body: {
          username: username,
          password: password,
          query: query,
          parameters: parameters
        }
      }, (err, json) => {
        
        if (err) {
          return this.failure(err);
        }

        // Using https://reqres.in/api/users
        // json contains {data: [...], total: 6, etc... }
        return dispatch(json);
      });
    };
  }

  /**
   * This method is used mainly by filters to support updating selected values by the user.
   * Unless you have to change it, copy it as is.
   */
  updateSelectedValues(dependencies: IDictionary, selectedValues: any) {
    if (Array.isArray(selectedValues)) {
      return Object.assign(dependencies, { 'selectedValues': selectedValues });
    } else {
      return Object.assign(dependencies, { ... selectedValues });
    }
  }

  private validateParams(params: INewDataSourceParams): void {
    if (true) {
      return;
    }

    throw new Error('Params are bad');
  }
}
```
Then, to declare this data source, edit the following file:

`/client/src/data-sources/plugins/index.ts`

```ts
import NewDataSource from './NewDataSource';

export default {
  ...,
  'NewDataSource': NewDataSource
};

```

## Using in a template

To use the data source in a dashboard:

`example.private.js`:

```js
return  {
  id: "example",
  ...,
  config: {
    connections: {
      /* The following parameters will be automatically requested if not supplied here */
      /* "new-connection" is derived from the type property of the Connection Type class */
      "new-connection": { username: "admin",password: "123456" }
    },
    layout: {...}
  },
  dataSources: [
    {
      id: "some_id",
      type: "NewDataSource",
      params: {
        query: "SELECT * FROM USERS",
        parameters: { a: 1, b: 2, c: 3 }
      },
      format: { type: "bars", args: { valueField: "id", barsField: "first_name", seriesField: "lastName" } }
    }
  ],
  elements: [
    {
      id: "bar_sample1",
      type: "BarData",
      title: "Some Bar Data",
      subtitle: "Description of bar sample 1",
      size: { w: 5, h: 8 },
      source: "some_id",
    }
  ],
  ...
}
```
