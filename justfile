set shell := ["nu", "-c"]

alias e := edit
alias n := new

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

backup-img:
        mc cp pic/pic . -r
        mv pic imgs
