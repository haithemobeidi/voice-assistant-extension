# Phase 6: Trading Resources

## Overview
Create a simple informational page that directs users to established, safe Pokémon trading communities. This replaces the originally planned "Trading Hub" to avoid legal liability and COPPA compliance issues associated with facilitating user-to-user communication.

## Prerequisites
- [x] Phase 1 completed (navigation structure in place)
- [x] Phase 2 completed (Type Calculator working)
- [ ] Phase 3 completed (Team Builder & PWA)
- [ ] Phase 4 completed (Android App Setup - if applicable)
- [ ] Phase 5 completed (Android Features - if applicable)
- [ ] Research established Pokémon trading communities
- [ ] Verify community links are active and well-moderated

## Deliverables
- [ ] Trading Resources page with clean, informative layout
- [ ] Curated list of safe, established trading communities
- [ ] Brief descriptions for each community resource
- [ ] Links open in new tabs with proper security attributes
- [ ] Responsive design matching app design system
- [ ] Navigation integration (Trading icon in bottom nav)

## Steps

### 1. Research Trading Communities
Identify and verify these established communities:
- **r/pokemontrades** - Reddit's main trading subreddit (100k+ members, strict moderation)
- **r/CasualPokemonTrades** - Casual trading community with verified traders
- **Serebii.net Forums** - Long-established Pokémon community forums
- **Smogon Trading Forums** - Competitive Pokémon community with trading section
- **Official Pokémon Discord servers** - Nintendo-affiliated Discord communities

### 2. Create Trading Resources Page
```typescript
// pages/TradingResourcesPage.ts
- Header: "Where to Trade Pokémon"
- Intro text explaining this is a directory of safe communities
- Card-based layout for each resource
- Each card shows:
  - Community name
  - Platform (Reddit, Discord, Forum)
  - Brief description (1-2 sentences)
  - Member count/activity indicator
  - "Visit Community" button (external link)
```

### 3. Implement Page Layout
- Use existing Card component from design system
- Grid layout: 1 column mobile, 2 columns tablet+
- Phosphor icons for platform types (Reddit, Discord, Globe)
- Consistent spacing with other pages

### 4. Add External Link Security
```typescript
// All external links should have:
target="_blank"
rel="noopener noreferrer"
```

### 5. Update Navigation
- Ensure "Trading" nav item routes to `/trading-resources`
- Update nav icon if needed (could use "Link" or "Globe" icon)
- Update any placeholder text on home page

### 6. Add Disclaimer (Optional)
Small footer text:
"These are external communities not affiliated with Poke-Kit. Please follow each community's rules and guidelines."

## Success Criteria
- ✅ Page displays 4-6 curated trading communities
- ✅ All links verified working and point to legitimate communities
- ✅ External links open in new tabs with security attributes
- ✅ Responsive layout works on mobile and desktop
- ✅ Design matches app's Pokémon design system
- ✅ No user data collection or matching features
- ✅ Navigation routes correctly

## Status: NOT_STARTED

## Notes
- **Legal Safety**: This approach avoids liability by providing information only (no user matching, no communication facilitation)
- **No Backend Needed**: Pure frontend, static content
- **Easy to Update**: Add/remove communities as needed
- **User Safety**: All linked communities have their own established moderation systems
- This phase is much simpler than original "Trading Hub" plan (no Firebase, no user accounts, no chat)
- Focus on quality over quantity - better to list 5 great communities than 20 mediocre ones

## Future Enhancements (Optional)
- Add "Last Verified" dates for community links
- Include brief trading tips/etiquette guide
- Add filters (by platform, by game generation, etc.)
- Community spotlight section
