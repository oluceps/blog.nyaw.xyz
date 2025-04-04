{
  description = "flake for this";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    devenv.url = "github:cachix/devenv";
    rust-overlay.url = "github:oxalica/rust-overlay";
    wrangler.url = "https://flakehub.com/f/ryand56/wrangler/*.tar.gz";
  };

  nixConfig = {
    extra-trusted-public-keys = [
      "wrangler.cachix.org-1:N/FIcG2qBQcolSpklb2IMDbsfjZKWg+ctxx0mSMXdSs="
      "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw="
    ];
    extra-substituters = [
      "https://wrangler.cachix.org"
      "https://devenv.cachix.org"
    ];
  };

  outputs =
    inputs@{ flake-parts, wrangler, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ inputs.devenv.flakeModule ];
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];
      perSystem =
        { system, pkgs, ... }:
        {
          _module.args.pkgs = import inputs.nixpkgs {
            inherit system;
            overlays = [ inputs.rust-overlay.overlays.default ];
          };

          # broken `nix flake show` but doesn't matter.
          devenv.shells.default = {
            enterShell = ''
              [ ! -f .env ] || export $(grep -v '^#' .env | xargs)
            '';
            languages.javascript = {
              enable = true;
              npm.install.enable = false;
            };
            packages =
              with pkgs;
              [
                nodePackages_latest.pnpm
                typescript
                biome
                rustup
                wasm-pack
                (rust-bin.nightly.latest.default.override { extensions = [ "rust-src" ]; })
              ]
              ++ [ wrangler.packages.${system}.default ];
          };
        };
    };
}
