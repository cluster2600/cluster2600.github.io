# Maxime Grenu

Personal professional profile published at https://cluster2600.github.io.

## Publishing both sites

This repository's `main` branch is the source for both public sites. Make content,
photo, CSS and JavaScript changes here. GitHub Pages publishes this site normally.

The `Publish synchronized site` workflow in
`maximedegrenus/maximedegrenus.github.io` checks this source every five minutes
and publishes the same files at https://maximedegrenus.github.io, adapting the
Open Graph URLs to that address. GitHub may delay scheduled runs. The workflow
can also be run manually after an update. Unchanged revisions are skipped.

Do not edit site content in the mirror repository: its publication uses this
repository, not the mirror's content files. The mirror needs no cross-account
token or secret. Scheduled GitHub workflows can be disabled after 60 days of
repository inactivity; re-enable the workflow in Actions if needed.
