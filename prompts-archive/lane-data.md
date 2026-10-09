You are the DATA lane for TraveloVegas. Read CLAUDE.md. You may ONLY edit files in data/. Never touch src/, css/, js/, design/.

Job: verify listings in data/listings.json and add the missing categories, using web search. Today's date is whatever `date` says.

1. For every listing whose status is "likely_open" or "unverified": confirm status from an official venue/resort page or Las Vegas news dated within the last 12 months. Update status, venue, hours/price only if a source states them, add the source URL, set last_checked to today. If you can't confirm, leave it "likely_open" and add notes: "unconfirmed".
2. Add listings for categories in "not_yet_inventoried", starting with shows (O, KA, Mystère, MJ ONE, Blue Man Group, Absinthe, Shin Lim at Palazzo Theatre, Mat Franco, Wizard of Oz at Sphere, Metallica at Sphere), then tours, then free attractions, then restaurants. Same schema as existing entries. Mark adult/strip club/cannabis entries with "adult": true and booking: null.
3. Apply known changes: Le Cirque closed Aug 23 2026; Picasso closed 2024; Aureole closed; Margaritaville Flamingo closed; Diablo's Cantina closed (Mirage); Red Lotus and Robert Irvine's closed (Tropicana); David Copperfield MGM ended Apr 30 2026; XS reopens Nov 5 2026; Cromwell is now The Vanderpump Hotel; Drai's moved to the basement; Bally's is Horseshoe.
4. Keep JSON valid (run `node -e "JSON.parse(require('fs').readFileSync('data/listings.json'))"`).
5. Commit in batches of ~20 listings with message "data: verify <category>". Stop after shows + tours + free attractions are done and print a summary table of status counts.
