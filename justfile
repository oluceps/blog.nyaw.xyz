set shell := ["nu", "-c"]

alias e := edit
alias n := new

default:
    @just --choose

server:
        pnpm dev
new:
        #!/usr/bin/env nu
        let name = input
        let path = $"src/routes/($name).mdx"
        let d = date now | format date "%+"
        $"---
        date: ($d)
        description:
        categories:
          - 记录
        tags:
          -
        title: ($name)
        ---
        " | save $path
        hx $path
edit:
        hx src/routes/

upload-images:
        mc cp ./imgs/* pic/pic -r

replace-local-images:
        mc cp pic/pic . -r
        mv imgs imgs-backup
        mv pic imgs

get-all-tag:
        deno eval "import data from \"./src/routes/data\"; console.log(JSON.stringify(data))" --unstable-sloppy-imports | jq '[.[].tags[]] | unique'
