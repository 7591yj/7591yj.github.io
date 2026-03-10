{pkgs, ...}: {
  packages = with pkgs; [
    bun
    nodejs
  ];

  processes.dev.exec = "bun run dev";

  enterShell = ''
    echo "Use 'devenv up' to run the Astro dev server."
    echo "Use direnv for automatic shell activation in this repo."
  '';
}
