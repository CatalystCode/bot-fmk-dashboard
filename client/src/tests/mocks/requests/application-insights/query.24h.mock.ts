export default {
  "Tables": [
    {
      "TableName": "Table_0",
      "Columns": [
        {
          "ColumnName": "timestamp",
          "DataType": "DateTime",
          "ColumnType": "datetime"
        },
        {
          "ColumnName": "name",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "customDimensions",
          "DataType": "String",
          "ColumnType": "dynamic"
        },
        {
          "ColumnName": "customMeasurements",
          "DataType": "String",
          "ColumnType": "dynamic"
        },
        {
          "ColumnName": "operation_Name",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "operation_Id",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "operation_ParentId",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "operation_SyntheticSource",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "session_Id",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "user_Id",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "user_AuthenticatedId",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "user_AccountId",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "application_Version",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "client_Type",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "client_Model",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "client_OS",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "client_IP",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "client_City",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "client_StateOrProvince",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "client_CountryOrRegion",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "client_Browser",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "cloud_RoleName",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "cloud_RoleInstance",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "appId",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "appName",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "iKey",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "sdkVersion",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "itemId",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "itemType",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "itemCount",
          "DataType": "Int32",
          "ColumnType": "int"
        }
      ],
      "Rows": []
    },
    {
      "TableName": "Table_1",
      "Columns": [
        {
          "ColumnName": "Value",
          "DataType": "String",
          "ColumnType": "string"
        }
      ],
      "Rows": [
        [
          "{\"Visualization\":\"table\",\"Title\":\"\",\"Accumulate\":false,\"IsQuerySorted\":false,\"Kind\":\"\",\"Annotation\":\"\",\"By\":null}"
        ]
      ]
    },
    {
      "TableName": "Table_2",
      "Columns": [
        {
          "ColumnName": "Timestamp",
          "DataType": "DateTime",
          "ColumnType": "datetime"
        },
        {
          "ColumnName": "Severity",
          "DataType": "Int32",
          "ColumnType": "int"
        },
        {
          "ColumnName": "SeverityName",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "StatusCode",
          "DataType": "Int32",
          "ColumnType": "int"
        },
        {
          "ColumnName": "StatusDescription",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "Count",
          "DataType": "Int32",
          "ColumnType": "int"
        },
        {
          "ColumnName": "RequestId",
          "DataType": "Guid",
          "ColumnType": "guid"
        },
        {
          "ColumnName": "ActivityId",
          "DataType": "Guid",
          "ColumnType": "guid"
        },
        {
          "ColumnName": "SubActivityId",
          "DataType": "Guid",
          "ColumnType": "guid"
        },
        {
          "ColumnName": "ClientActivityId",
          "DataType": "String",
          "ColumnType": "string"
        }
      ],
      "Rows": [
        [
          "2017-03-21T14:11:55.719294Z",
          4,
          "Info",
          0,
          "Query completed successfully",
          1,
          "92b14bff-f3b7-4dd1-bbee-4a0b0ededefe",
          "92b14bff-f3b7-4dd1-bbee-4a0b0ededefe",
          "f3d91762-6f9c-4314-b731-a82a1eeb701f",
          "faa8dc78-8f96-4085-927f-ad16a0dd7e71"
        ],
        [
          "2017-03-21T14:11:55.719294Z",
          6,
          "Stats",
          0,
          "{\"ExecutionTime\":0.0156835,\"resource_usage\":{\"cache\":{\"memory\":{\"hits\":3077,\"misses\":0,\"total\":3077},\"disk\":{\"hits\":0,\"misses\":0,\"total\":0}},\"cpu\":{\"user\":\"00:00:00.1093750\",\"kernel\":\"00:00:00\",\"total cpu\":\"00:00:00.1093750\"},\"memory\":{\"peak_per_node\":369100864}}}",
          1,
          "92b14bff-f3b7-4dd1-bbee-4a0b0ededefe",
          "92b14bff-f3b7-4dd1-bbee-4a0b0ededefe",
          "f3d91762-6f9c-4314-b731-a82a1eeb701f",
          "faa8dc78-8f96-4085-927f-ad16a0dd7e71"
        ]
      ]
    },
    {
      "TableName": "Table_3",
      "Columns": [
        {
          "ColumnName": "Ordinal",
          "DataType": "Int64",
          "ColumnType": "long"
        },
        {
          "ColumnName": "Kind",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "Name",
          "DataType": "String",
          "ColumnType": "string"
        },
        {
          "ColumnName": "Id",
          "DataType": "String",
          "ColumnType": "string"
        }
      ],
      "Rows": [
        [
          0,
          "QueryResult",
          "PrimaryResult",
          "25ddba4f-1cc7-42f8-8879-1b6c5cf9e028"
        ],
        [
          1,
          "QueryResult",
          "@ExtendedProperties",
          "c547bb07-fff2-4792-b5fd-90b04f185f3a"
        ],
        [
          2,
          "QueryStatus",
          "QueryStatus",
          "00000000-0000-0000-0000-000000000000"
        ]
      ]
    }
  ]
};