# New framework for Jest code re-use

See this guide for a rundown on the new Jest helper.  
You technically don't need to use this, but it should make life easier.

# How it was done

### Environment setup

The jest configuration in `package.json` was modified to execute `./jest/tests_common` before each test suite. This allows tests to use common mocks and helpers without needing to copy-paste them into each test.

### Structure

There is a new folder, `jest`, in which you'll find

- `tests_common.js` — The main pre-test file. It creates a global object called `jest` containing shared helpers + mock generators.
- `tests_models.js` — Contains model mock generators. These are used by `tests_common`.

# How it works?

When you use the init functions, it does all the necessary mocks for you and places each `require(...)` into `global.jest` so they can be included.

### Syntax

First, use init functions.

```js
global.jest.init();
global.jest.init_routes();
```

Then you can use this syntax to require mocks or helpers:

```js
const { User, request, app, log, env, auth, dataForGetUser } = global.jest;
```

If you're testing the real one, don't include it here. For example, don't grab `User` from the global if you're writing `User.test.js` — just `require(...)` it like you normally would.\*

\* _Also do `init(false)` — see below._

### Functions we can use in all tests now

The most important functions found in `global.jest` are ...

- `init()` - When called, does some setup needed for pretty much all tests (mock environment, disable logging).

  - Mocks the models. **If you're testing a model, use `init(false)` instead.**

- `init_routes()` - When called, does some setup needed for testing routes. Use this in your route tests.

  - Mocks authentication. Adds a new function `auth.loginAs(user)` that simulates that user's permissions.
  - It depends on the `User` mock for authentication, so **run `init()` first.**

- `init_db()` - When called, mocks `db.query`.

  - If your test needs it, grab `db` from `global.jest`.

- Helper functions like `dataForGetUser` and `dataForGetCourse`.
  - You can add new helpers!

### How do I mock a new model?

If you wrote a new model, add its mock generator to `tests_models` based on what's there already.  
If you added a new function to a model, **be sure to also mock it** in `tests_models`.

# Problems?

If you experience problems with this framework, or if your test is so specialized that it doesn't make any sense to share code, just write it the old way — everything should still work fine.
