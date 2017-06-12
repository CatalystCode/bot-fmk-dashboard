# CosmosDB 

CosmosDB can be added to the list of required connections.

## Config 
To enable [Cosmos DB](https://azure.microsoft.com/en-us/services/cosmos-db/) data sources add 'cosmos-db' to the connections config. The host name and password key are required values.

```js
connections: {
  'cosmos-db': { 
    'host': "",
    'key': ""
  }
}
```

NB. The host name excludes the '.documents.azure.com' suffix.

## Data Sources 
| Property | Type | Value | Description 
| :--------|:-----|:------|:------------
| `id`| `string` || ID of the element
| `type`| `string` | "CosmosDB/Query" | Data source plugin name
| `dependencies`| `object` || A collection of key values referenced by queries
| `params`| `object` || Contains `databaseId`, `collectionId`, `query` and `parameters`
| `calculated` | `function` || Result contains array of `Documents`, `_rid` and `_count` properties.

## Params
| Property | Type | Description 
| :--------|:-----|:------------
| `databaseId`| `string` | Database Id (default is 'admin')
| `collectionId`| `string` | Collection Id
| `query`| `string` | SQL query string
| `parameters`| `object[]` | Parameterized SQL request

More info about SQL `query` string and `parameters` are available in the [CosmosDB documentation](https://docs.microsoft.com/en-us/rest/api/documentdb/querying-documentdb-resources-using-the-rest-api). You can try out Cosmos DB queries using the *Query Explorer* in the [Azure portal](https://portal.azure.com/), or learn using the [SQL demo](https://www.documentdb.com/sql/demo). 

## Sample data source
```js
{
  id: "botConversations",
  type: "CosmosDB/Query",
  dependencies: { timespan: "timespan", queryTimespan: "timespan:queryTimespan" },
  params: {
  	databaseId: "admin",
  	collectionId: "conversations",
  	query: () => `SELECT * FROM conversations WHERE (conversations.state = 0)`,
  	parameters: []
  },
  calculated: (result) => {
    return result;
  }
}
```

## Sample element

```
{
  id: "conversations",
  type: "Scorecard",
  title: "Conversations",
  subtitle: "Total conversations",
  size: { w: 4, h: 3 },
  dependencies: {
  	card_conversations_value: "botConversations:_count",
  	card_conversations_heading: "::Conversations",
  	card_conversations_icon: "::chat"
  }
}
```