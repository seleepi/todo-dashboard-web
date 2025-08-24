/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "c0eg1hne79m8ozj",
    "created": "2025-08-23 15:39:24.275Z",
    "updated": "2025-08-23 15:39:24.275Z",
    "name": "widgets",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "b27ptbw4",
        "name": "dashboard",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "31auyzzcva9jfeq",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "sr6cd9dj",
        "name": "type",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "todo",
            "text",
            "clock-weather",
            "youtube"
          ]
        }
      },
      {
        "system": false,
        "id": "yapvkplm",
        "name": "position_x",
        "type": "number",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "quhjv9g0",
        "name": "position_y",
        "type": "number",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "m15pslwg",
        "name": "size_width",
        "type": "number",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 300,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "ffdvhwvy",
        "name": "size_height",
        "type": "number",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "zjzdftse",
        "name": "data",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "system": false,
        "id": "nwszrzib",
        "name": "collapsed",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
    "listRule": "dashboard.user = @request.auth.id",
    "viewRule": "dashboard.user = @request.auth.id",
    "createRule": "dashboard.user = @request.auth.id",
    "updateRule": "dashboard.user = @request.auth.id",
    "deleteRule": "dashboard.user = @request.auth.id",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("c0eg1hne79m8ozj");

  return dao.deleteCollection(collection);
})
