# eslint-ls
> ESLint Language Server

## Features
- [x] Line diagnostics
- [x] Code actions for fixes and suggestions
- [x] Document formatting for fixes
- [ ] Range document formatting

## Installation
```sh
git clone https://github.com/jackieaskins/eslint-ls
cd eslint-ls
npm install && npm run distribute
```

## Usage
### Neovim
```lua
local lspconfig = require'lspconfig'
local configs = require'lspconfig/configs'
local util = require'lspconfig/util'

if not lspconfig.eslintls then
  configs.eslintls = {
    default_config = {
      cmd = {'eslint-ls', '--stdio'};
      filetypes = {
        'javascript',
        'javascriptreact',
        'typescript',
        'typescriptreact'
      };
      root_dir = util.root_pattern(
        '.eslintrc',
        '.eslintrc.js',
        '.eslintrc.json',
        '.eslintrc.yaml',
        '.eslintignore',
        'package.json',
        '.git'
      );
    }
  }
end

lspconfig.eslintls.setup{}
```
