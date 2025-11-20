# OSCD Plugin Svelte

Run with `VITE_EXTERNAL_PLUGINS=true pnpm run build:watch`. <br>
The restricted version (no ability to add manual plugins) is available with just `pnpm run build:watch`.

## Test in the OpenSCD Instance

To use the unrestricted version, set `VITE_EXTERNAL_PLUGINS=true` and use:
```
http://localhost:50713/index.js
```
For the restricted version, use:
```
http://localhost:50713/index-restricted.js
```

In your custom plugin, add a new menu item:
- Uncheck "Requires loaded document"
- Set the position to "bottom"
- Use the appropriate URL from above

## Troubleshooting

If you do not see your changes, try clearing your browser cache.

