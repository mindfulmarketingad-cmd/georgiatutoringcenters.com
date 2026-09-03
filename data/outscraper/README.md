# Outscraper exports

Drop your Outscraper Google Maps export here as `.csv` or `.json`, then run:

```bash
npm run import
```

Every file in this folder is merged, normalised and written to `data/listings.json`,
which is the only file the site reads. Recognised column names include:

`name`, `site`/`website`, `category`, `subtypes`, `phone`, `full_address`, `street`,
`city`, `state`/`us_state`, `postal_code`, `latitude`, `longitude`, `rating`,
`reviews`, `reviews_link`, `location_link`, `photos_count`, `range`,
`business_status`, `verified`, `about`/`description`, `working_hours`, `place_id`.

Unknown columns are ignored, missing columns degrade gracefully.

While this folder holds no export, `npm run import` falls back to
`data/sample-listings.json` and flags the build as sample data — the site then
shows a "sample data" notice on listing pages.
