# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-10-29

### Added
- Added Documentation how to test in the OpenSCD instance

### Changed
- Migrated to Svelte 5
- `installed` is not a property of Plugin anymore

## [1.0.0] - 2024-11-18

### Added
- Search filter (#130)
- Only Installed filter (#130)
- Install/uninstall plugins (#129)
- Plugin type label next to author (#8)
- Plugin Store registry in JSON (#1)
- Build restricted version of Plugin Store (#10)
- Full description text on hover (#18)
- Sticky headers for plugin types (#25)
- Add External Plugins popup (#5)
- Plugin icons (#30)

### Changed
- Only Installed filter is a switch instead of a checkbox (#6)
- Search also includes authors (#7)
- Plugin Store registry includes descriptions (#21)
- Order plugins by plugin type (#19)
- Search filters are fixed to the top (#25)

### Fixed
- State changes after installing/uninstalling plugins now reflect correctly in UI (#28)
