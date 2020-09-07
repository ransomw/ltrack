# ltrack

## the _l_ is for _life_

### system prerequisites

`node`+`npm` provided by the operating system suffice

this readme describes using python to serve static
files.  any web server can be used.

### install library dependencies

```
npm install
```

in the project root directory

### build static files

```
node bin/build
```

from the project root directory

### serve `public/`

after build, the static files
are a web application.

use any web server to access them
_note_ opening `public/index.html`
using a `file:///` uri or otherwise
isn't recommended.

```
python3.8 -m http.server 5005
```

from `public/`

and

```
http://localhost:5005
```

in your browser.

## status, history

ltrack formerly used
[hoodie](http://hood.ie/)
(last seen at 4ce42ce)
to provide authentication
and optional backend storage.

currently, data is stored in a couple
of arrays in the javascript engine,
some things are disabled, and
there is a lot of cruft from the hoodie removal.
or perhaps the cruft is from using Angular
(at all).
