# Contributing

## Releasing to npm

1. Merge the tested change into `main` with a Conventional Commit title. Mark a breaking change with `!` (for example, `feat!:`) or a `BREAKING CHANGE:` footer.
2. Review the version and changelog in the draft `chore: release v… [release-please]` PR. Mark it ready and merge it after the checks pass.
3. Open the [npm Release workflow](.github/workflows/cd-npm-release.yml). It creates the GitHub release and publishes via npm Trusted Publishing using GitHub Actions OIDC.
4. Confirm the new version with `npm view readme-i18n-sentinel@latest version`. If publication fails, inspect the **Publish to npm** step and check which versions already exist on npm before retrying.
