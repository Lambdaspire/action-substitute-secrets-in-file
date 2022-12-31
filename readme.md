# Substitute Secrets into Tokenised File

Substitute GitHub Secrets into a File, matching on a specified Token format.

i.e. If you have these GitHub Secrets:
- TEST = ABC123
- PREFERRED_CURRENCY = BITCOIN

You can substitute their values into files containing tokenised symbols like `${TEST}`, rather than listing them out inline - one by one - all over the place.

i.e. Stop repeating YAML in your GitHub actions like this:

```yaml
env:
  MY_SECRET: ${{ secrets.MY_SECRET }}
  MY_OTHER_SECRET: ${{ secrets.MY_SECRET }}
  ETC: ${{ secrets.ETC }}
  AD_NAUSEAM: ${{ secrets.MAKE_IT_STOP }}
```

and just commit config files to source control like this:

```json
{
    "wow": "${WOW}",
    "so": {
        "much": "${BETTER}"
    },
    "simply-amazing": "${I_KNOW_RIGHT}"
}
```

![Noice](https://media0.giphy.com/media/yJFeycRK2DB4c/200w.gif?cid=6c09b952kg6svgzl5yjrfyordac185891yug766f29gi7riu&rid=200w.gif&ct=g)

## Important

The main thing that makes this work is passing the `secretsJson` input to the action with a value of `${{ toJSON(secrets) }}`. You must do this.

```yaml
secretsJson: ${{ toJSON(secrets) }}
```

This provides the full set of GitHub Secrets to the action as a JSON string, which it then converts to a dictionary internally.

Examples below.

## Examples

Example GitHub Secrets:
- TEST = ABC123
- PREFERRED_CURRENCY = BITCOIN

Example file in repo: **./config.json**<br/>
*Uses `${TOKEN}` format.*

```json
{
  "test": "${TEST}",
  "preferences": {
    "currency": "${PREFERRED_CURRENCY}"
  },
  "not-secret": "${NOT_SECRET}",
  "wrong-case": "${test}"
}
```

Another example file in repo: **./some/subfolder/app.env**<br/>
*Uses `#{TOKEN}#` format.*

```
TEST = #{TEST}#
PREF_CUR = #{PREFERRED_CURRENCY}#
```

Example GitHub Action: **action.yml**

```yaml
jobs:
  
  example:
    
    name: Example
    runs-on: ubuntu-latest

    steps:
    
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Replace config.json
        uses: Lambdaspire/action-substitute-secrets-in-file@v1.0.0
        with:
          file: config.json
          tokenPattern: ${TOKEN}
          secretsJson: ${{ toJSON(secrets) }}
      
      - name: Replace some/subfolder/app.env, into a new file
        uses: Lambdaspire/action-substitute-secrets-in-file@v1.0.0
        with:
          file: some/subfolder/app.env
          output: some/subfolder/app.env.replaced
          tokenPattern: '#{TOKEN}#'
          secretsJson: ${{ toJSON(secrets) }}
      
      # File will now contain secrets injected where ${TOKEN} matches on Secret name.
      - run: cat config.json

      # File will now contain secrets injected where #{TOKEN}# matches on Secret name.
      - run: cat some/subfolder/app.env.replaced

      # This one will remain unchanged as the output was to a new file, some/subfolder/app.env.replaced
      - run: cat some/subfolder/app.env
```

In GitHub Actions logs, you will see the file contents outputted with `*` asterisks in place of the secrets.

Typically, though, you won't simply log the contents. You'll actually use them for something valuable...

Maybe.