# token-tx

Bridge service to faciliate Ethereum token transfers.

A hosted instance is available on Heroku: [https://token-tx.herokuapp.com](https://token-tx.herokuapp.com/).

## Flow

![Transaction Flow](https://raw.githubusercontent.com/kern/token-tx/master/resources/flow.png)

1. Transaction Sender creates a new session with its public key
2. Bridge Server returns the URL for the session (`data.href`)
3. Transaction Sender sends the session URL to the intended Transaction Receiver (such as via SMS)
4. Transaction Receiver updates the session with its wallet address
5. Transaction Sender polls the session for updates to the wallet address
6. Transaction Sender receives the Transaction Receiver’s wallet address and signs a transaction to send the token

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

#### Response

A [Session](#session-object) object.

### Session Object

A token transfer session.

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
    "_id": "abcdefghijklm789",
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

## License &amp; Acknowledgements

Apache 2.0. Written by [Alex Kern](https://github.com/kern) and [Andrew Gold](https://github.com/AndrewGold) at [ETHSanFrancisco 2018](https://ethsanfrancisco.com).
