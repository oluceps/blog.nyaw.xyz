set shell := ["nu", "-c"]

alias e := edit
alias n := new
alias d := deploy


default:
    @just --choose
deploy:
    just clean; pnpm build; wrangler --cwd .output/ deploy
clean:
    rm -rf .output .vinxi dist

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
        mc cp ./imgs/* blog-assets/blog-assets -r

replace-local-images:
        mc cp pic/pic . -r
        mv imgs imgs-backup
        mv pic imgs

get-all-tag:
        deno eval "import data from \"./src/routes/data\"; console.log(JSON.stringify(data))" --unstable-sloppy-imports | jq '[.[].tags[]] | unique'

edit-enc *args:
    #!/usr/bin/env nu
    let tmpf = $'/tmp/(uuidgen)'
    let source = "./public/8deafb0f-60fe-4558-a1a2-ccec720adfc8.age"
    rage -d $source -o $tmpf
    hx $tmpf
    rage -e -p $tmpf -o $source
    srm -C $tmpf

gen-proto:
	mkdir -p src/ingredients/grpc
	protoc --plugin=protoc-gen-ts_proto=node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=src/ingredients/grpc -I../hatoreto-rehoso ../hatoreto-rehoso/rate.proto
