# Contributing

## Reporting Issues

Found a problem? Want a new feature?

- See if your issue or idea has [already been reported].
- Provide a [reduced test case] or a [live example].

Remember, a bug is a *demonstrable problem* caused by *our* code.

## Submitting Pull Requests

Pull requests are the greatest contributions, so be sure they are focused in scope, and do avoid unrelated commits.

1. To begin, [fork this project], clone your fork, and add our upstream.
   ```bash
   # Clone your fork of the repo into the current directory
   git clone https://github.com/<your-username>/vuex-map-fields
   # Navigate to the newly cloned directory
   cd vuex-map-fields
   # Assign the original repo to a remote called "upstream"
   git remote add upstream https://github.com/maoberlehner/vuex-map-fields
   # Install the tools necessary for development
   yarn install
   ```
2. Create a branch for your feature or hotfix:
   ```bash
   # Move into a new branch for a feature
   git checkout -b feature/thing
   ```
   ```bash
   # Move into a new branch for a hotfix
   git checkout -b hotfix/something
   ```
3. Push your branch up to your fork:
   ```bash
   # Push a feature branch
   git push origin feature/thing
   ```
   ```bash
   # Push a hotfix branch
   git push origin hotfix/something
   ```
4. Now [open a pull request] with a clear title and description.

[already been reported]: https://github.com/maoberlehner/vuex-map-fields/issues
[fork this project]:     https://github.com/maoberlehner/vuex-map-fields/fork
[live example]:          http://codepen.io/pen
[open a pull request]:   https://help.github.com/articles/using-pull-requests/
[reduced test case]:     https://css-tricks.com/reduced-test-cases/
