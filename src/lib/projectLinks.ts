const serviceLabels = new Map([
  ["github.com", "GitHub"],
  ["gitlab.com", "GitLab"],
  ["npmjs.com", "npm"],
  ["pypi.org", "PyPI"],
  ["jsr.io", "JSR"],
  ["crates.io", "crates.io"],
  ["rubygems.org", "RubyGems"],
  ["packagist.org", "Packagist"],
  ["nuget.org", "NuGet"],
  ["central.sonatype.com", "Maven Central"],
  ["search.maven.org", "Maven Central"],
  ["hub.docker.com", "Docker Hub"],
  ["huggingface.co", "Hugging Face"],
]);

export function projectLinkLabel(href: string, label?: string): string {
  if (label?.trim()) return label.trim();
  const hostname = new URL(href).hostname.replace(/^www\./, "");
  return serviceLabels.get(hostname) ?? hostname;
}
