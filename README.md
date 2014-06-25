# etcdump

Command line tool to dump and restore [etcd](https://github.com/coreos/etcd) keys.

## Installation

    $ npm install -g arkenio/etcdump

This module is not yet published on npm.

## Dumping

### Usage

    $ etcdump dump

This is the easiest way to dump the whole `etcd` keys. Results are stored in a `etcdump.json`
file in the directory where you executed the command.

You can change this file by using the `--file` option:

    $ etcdump --file mydump.json dump

By default, the `etcdump` command use the default configuration:

    {
      "etcdHost": "localhost",
      "etcdPort": 4001,
      "dump": {
        "keys": [
          {
            "key": "/",
            "recursive": true
          }
        ]
      }
    }

You can override it by specifying your own configuration file through the `--config` option:

    $ etcdump --config myconfig.json dump

### Configuration

The `dump.keys` supports differents configurations:

  {
    "key": "/",
    "recursive": true
  }

Recursively dump all the keys inside `/`.

  {
    "key": "/key1"
  }

Dump only the key `/key1`.

  {
    "key": "/",
    "recursive": true,
    "pattern": ".*/object$"
  }

Recursively dump only the keys matching the given `pattern` inside `/`.

If you have the following keys in `etcd`:

    /dir/key1/object
    /dir/key1/target
    /dir/dir2/dir3/object

You will end up dumping only:

    /dir/key1/object
    /dir/dir2/dir3/object

### Storage

Dumped keys are stored in an array:

    [keyConf1, keyConf2, keyConf3, ...]

Each `keyConf*` could be an object when dumping one key only, or an array when recursively dumping:

    [{ "key": "/key1", "value": "value1" }, [{ "key": "/dir/key1/object", "value": "test" }, { ... }], ...]

## Restoring

### Usage

    $ etcdump restore

Restore the keys from the `etcdump.json` file.

You can change this file by using the `--file` option:

    $ etcdump --file mydump.json restore

### Restoring strategy

The keys are restored sequentially by groups (elements of the outer array).

If you have the following JSON dump:

    [ key1, arrayOfKeys1, arrayOfKeys2 ]

The keys in `arrayOfKeys1` will be restored after `key1` is restored.
Keys of `arrayOfKeys2` will wait that all the keys of `arrayOfKeys1` are restored.
