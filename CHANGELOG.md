

# [0.2.0](https://github.com/bloomscorp/bloomsight.js/compare/v0.1.4...v0.2.0) (2024-03-13)


### Features

* add api to send email ([fc207ac](https://github.com/bloomscorp/bloomsight.js/commit/fc207ac46bcc043bb910df265ade3172f54d558a))

## [0.1.4](https://github.com/bloomscorp/bloomsight.js/compare/v0.1.3...v0.1.4) (2024-03-03)


### Performance Improvements

* optimize bundle size ([7fdfe3e](https://github.com/bloomscorp/bloomsight.js/commit/7fdfe3e08af52c2f08a7f137044976326dde7f75))

## [0.1.3](https://github.com/bloomscorp/bloomsight.js/compare/v0.1.2...v0.1.3) (2024-03-03)


### Bug Fixes

* attach event handlers to `window` for umd ([690539f](https://github.com/bloomscorp/bloomsight.js/commit/690539fb0c36352a85dbbf3737bff4a7d289020a))


### Performance Improvements

* improve bot detection ([af7cfff](https://github.com/bloomscorp/bloomsight.js/commit/af7cfff87ba144d76b674de81a3326391fb5bd47))

## [0.1.2](https://github.com/bloomscorp/bloomsight.js/compare/v0.1.1...v0.1.2) (2024-02-22)

## [0.1.1](https://github.com/bloomscorp/bloomsight.js/compare/v0.1.0...v0.1.1) (2024-02-22)


### Bug Fixes

* remove setTimeout for page view ([5c24e83](https://github.com/bloomscorp/bloomsight.js/commit/5c24e83bf1e5d335256ab590e63c8f0e8bd175fe))


### Performance Improvements

* change `sourcemap`` to `false` to reduce overall size ([88436b6](https://github.com/bloomscorp/bloomsight.js/commit/88436b6adabf75f45cb9259869f25f8bd0fe88fb))

# 0.1.0 (2024-02-22)


### Bug Fixes

* add initializer function ([adc0a6d](https://github.com/bloomscorp/bloomsight.js/commit/adc0a6d142ac87057cf958be8352711e59969fa1))
* add page view initializer ([92ebaff](https://github.com/bloomscorp/bloomsight.js/commit/92ebaffe121996ca6ec9b10b23569c901535ef38))
* minor type fix ([029a911](https://github.com/bloomscorp/bloomsight.js/commit/029a9115a0f6e99eb08485add36e2b75c526b7f0))
* store referred url when `logOnly` is `true` ([17155e2](https://github.com/bloomscorp/bloomsight.js/commit/17155e2c94c629341b6b6734ad6357d7f73a4851))


### Features

* add base transmission support ([2b21c57](https://github.com/bloomscorp/bloomsight.js/commit/2b21c573600783883590086cf13772b9dae1b4f4))
* add basic get http api ([5fb4017](https://github.com/bloomscorp/bloomsight.js/commit/5fb4017dba0a231fff5cba2c5e26126d21dcf206))
* add config to manage web api page view observer ([3c009c1](https://github.com/bloomscorp/bloomsight.js/commit/3c009c1cf67f2458c87924c261365cc06e8fe4f2))
* add data event api ([c79cbc4](https://github.com/bloomscorp/bloomsight.js/commit/c79cbc4a3c2713d67faf90e04fe2dfc18c2774c0))
* add initial config support ([f9dfc71](https://github.com/bloomscorp/bloomsight.js/commit/f9dfc712f41cb506413eca6c9a16b264bc310b9c))
* add location detection api implementation ([0b75d1b](https://github.com/bloomscorp/bloomsight.js/commit/0b75d1b6b722bb53e0914f95a4096104d1d7e06d))
* add location info interface ([520d514](https://github.com/bloomscorp/bloomsight.js/commit/520d514de4402e6b46487495e603c2277dc59af3))
* add log only support ([fd75512](https://github.com/bloomscorp/bloomsight.js/commit/fd755123e13de2bf7dc712eee31fa62db422d831))
* add observePageViewViaWebAPI option ([fca961b](https://github.com/bloomscorp/bloomsight.js/commit/fca961bd33130ff9bcef4c195d4911079d51494f))
* add page view event handler ([1ab5993](https://github.com/bloomscorp/bloomsight.js/commit/1ab59933477ce4227a2da7e4bba38e6ddcf8c337))
* add page view listener ([dc128c8](https://github.com/bloomscorp/bloomsight.js/commit/dc128c8625788a70cc8bccf13e9a70f8d3b4a727))
* add simple event handler ([d22530a](https://github.com/bloomscorp/bloomsight.js/commit/d22530a5b987c0bf4a64cb320b6de38226a879e9))
* add stop flag for individual service ([65945a5](https://github.com/bloomscorp/bloomsight.js/commit/65945a5870c0aa515cd215e68e1c1be989de2e5c))
* add support for filtering bot UA ([8006498](https://github.com/bloomscorp/bloomsight.js/commit/800649845c8728633dbc44e70bf1af6b5175c97a))
* add support for local storage ([b502731](https://github.com/bloomscorp/bloomsight.js/commit/b5027311b19e76652998166fec35391b3882260b))
* add support for location detection ([931eb4f](https://github.com/bloomscorp/bloomsight.js/commit/931eb4f57e3025ab1887cfb8769f0be986511066))
* add support for platform detection ([a08ba7c](https://github.com/bloomscorp/bloomsight.js/commit/a08ba7c013578e3f217aa90f6ab796f644cf8c37))
* add support for session detection ([f3062f4](https://github.com/bloomscorp/bloomsight.js/commit/f3062f4624264e00be633c0f0008aeb02f1a69c6))
* add support for session storage ([fcc970b](https://github.com/bloomscorp/bloomsight.js/commit/fcc970b65e6ce99f712b9798a48651f298817bd0))
* add support for user detection ([32ca949](https://github.com/bloomscorp/bloomsight.js/commit/32ca94933f0c20fa66811dca4425ccf6ae50b88c))
* add support to log event per session ([8e482a7](https://github.com/bloomscorp/bloomsight.js/commit/8e482a78fa03980e2c8d70fdd2a4fd47cce00787))
* add tsup config file ([e3ff2f9](https://github.com/bloomscorp/bloomsight.js/commit/e3ff2f96681fab21264d08feb1c85eb3be5311d9))
