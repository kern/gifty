# token-tx

Bridge service to faciliate Ethereum token transfers.

A hosted instance is available on Heroku: [https://token-tx.herokuapp.com](https://token-tx.herokuapp.com/).

## API

### POST `/sessions`

Creates a new token transaction session.

#### Parameters

|Name|Type|Description|
|---|---|---|
|`publicKey`|string *(optional)*|The public key to use for encrypting the receiver address|

#### Response

A [Session](#session-object) object.

### GET `/sessions/:session_id`

Returns the current state of a token transaction session.

#### Response

A [Session](#session-object) object.

### POST `/sessions/:session_id`

Updates the receiver address of a token transaction session.

#### Parameters

|Name|Type|Description|
|---|---|---|
|`address`|string *(required)*|The new receiver address to associate with the session|

### Session Object

A transfer session.

#### Fields

|Name|Type|Description|
|---|---|---|
|`_id`|string|The session identifier|
|`address`|string or null|The current receiver address associated with the session|
|`href`|string|The canonical URL for the session|
|`publicKey`|string or null|The public key to use for encrypting the receiver address|

#### Example

```json
{
  "data": {
    _id: "abcdefghijklm789",
    "address": null,
    "href": "https://.../sessions/abcdefghijklm789",
    "publicKey": "ABCDEF..."
  }
}
```

## Development

```shell
$ yarn
$ yarn mongodb
$ yarn watch
```

The development server should now be listening on 

## License

Apache 2.0
