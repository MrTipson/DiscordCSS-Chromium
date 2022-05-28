## About
This project contains the source code for a browser extension integration of the
[DisordCSS](https://github.com/MrTipson/DiscordCSS) stylesheets. It aims to
provide an easy and minimal way to customize your discord browser experience.

## Installation
This extension is sadly not available on the Chrome web store (and won't be for
the forseeable future). You can download the latest version from the
[releases](https://github.com/MrTipson/DiscordCSS-Chromium/releases), drag it
into your browser area and confirm the installation. *Note: some pages will
prevent the installation prompt from showing up.*

After installing, you need to refresh your discord tab if you already had
it open.

## Usage
Clicking on the extension icon will open a new window. The extension lists all
of the loaded stylesheets, which contain all of the custom CSS properties,
grouped by their selector. Any changes made will be applied to all of the discord
tabs.

**Important**: the _discord.css group contains a lot of selectors, but its very
likely only `.theme-dark` or `.theme-light` will be what you need (watch out,
there are a few of them, the one containing the largest amount of items is what
you want).

You can use the text input area to write any value for the desired property, or
use the color picker, which can be accessed on the right hand side, by clicking
on the square tile. Please be aware that not all of the properties accept colors,
in which case I would suggest using developer tools or referring to the 
[docs](https://github.com/MrTipson/DiscordCSS/tree/master/docs).

Stylesheets from the [DisordCSS](https://github.com/MrTipson/DiscordCSS) repo
can be enabled/disabled using the checkboxes next to them.