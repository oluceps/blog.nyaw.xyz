{
  description = "flake for this";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    devenv.url = "github:cachix/devenv";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs =
    inputs@{ flake-parts, ... }:
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
            dotenv.enable = true;
            languages.javascript = {
              enable = true;
              npm.install.enable = false;
            };
            packages = [
              pkgs.nodePackages_latest.pnpm
              pkgs.typescript
              pkgs.biome
              pkgs.rustup
              pkgs.wasm-pack
              (pkgs.rust-bin.nightly.latest.default.override { extensions = [ "rust-src" ]; })

            ];
          };
        };
    };
}
